import { Component, OnInit } from '@angular/core';
import { ProductsService } from './tab-product.service';
import { finalize, Observable } from 'rxjs';
import { Product } from './tab-product.model';
import { LoadingService } from '../services/loading.service';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { FileService } from '../services/file.service';
const IMAGE_DIR = 'stored-images';


interface LocalFile {
  id?: number;
	name: string;
	path: string;
	data: string;
  isDB: boolean;
  key?: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab-product.page.html',
  styleUrls: ['tab-product.page.scss'],
  standalone: false,
})
export class TabProductPage implements OnInit {
  limit: number = 1000;
  page: number = 1;
  name: string = '';
  images: LocalFile[] = [];
  productId: number = 0;

  constructor(
    private readonly productsService: ProductsService,
    private readonly fileService: FileService,
    private readonly loadingService: LoadingService,
    private plt: Platform,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.getProducts(this.limit, this.page, this.name);
  }

  async presentToast(text: any) {
		const toast = await this.toastCtrl.create({
			message: text,
			duration: 3000
		});
		toast.present();
	}

  async loadImages() {
    const loading = await this.loadingCtrl.create({
			message: 'Cargando imagenes...'
		});
		await loading.present();
    this.fileService.getImageByProduct(this.productId).subscribe({
      next: (data: any) => {
        this.images = data;
        loading.dismiss();
      }
    });
  }

  async selectImage() {
		const image = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 100,
    });

    if (image) {
      this.saveImage(image)
    }
	}

  async takeImage() {
		const image = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    if (image) {
      this.saveImage(image)
    }
	}

  base64ToBlob(base64: string, contentType: string): Blob {
    const parts = base64.split(',');
    if (parts.length !== 2 || !parts[1]) {
      throw new Error('El string base64 no está correctamente codificado.');
    }

    const byteCharacters = atob(parts[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
          path: photo.path!
        });
        return file.data;
    }
    else {
        const response = await fetch(photo.webPath!);
        const blob = await response.blob();
        return await this.convertBlobToBase64(blob) as string;
    }
  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    const blob = this.base64ToBlob(base64Data.toString(), `image/${photo.format}`);
    const fileName = new Date().getTime() + `.${photo.format}`;
    const formData = new FormData();
    formData.append('file', blob, fileName);
    this.uploadImage(formData);
  }

  async uploadImage(formData: FormData) {
    const loading = await this.loadingCtrl.create({
        message: 'Uploading image...',
    });
    await loading.present();

    this.fileService.createImage(formData).subscribe({
      next: (res: any) => {
        this.fileService.saveImage(res.image).subscribe({
          next: (resS: any) => {
            this.fileService.saveProductImage(this.productId, resS.imageId).subscribe({
              next: () => {
                this.loadImages();
                loading.dismiss();
              }
            });
          }
        });
      }
    });
  }

  async deleteImage(file: LocalFile) {
    if (file.isDB && file.key) {
      this.fileService.deleteImage(file.key).subscribe({
        next: () => {
          if (file.id) {
            this.fileService.removeImageProduct(this.productId, file.id).subscribe({
              next: () => {
                if (file.id) {
                  this.fileService.removeImage(file.id).subscribe({
                    next: () => {
                      this.finalizeImageDeletion();
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  }

private finalizeImageDeletion() {
  this.loadImages();
  this.presentToast('Imagen removida.');
}

  async getProducts(
    limit = this.limit,
    page = this.page,
    name = this.name,
  ): Promise<void> {
    this.updatePage(page);
    this.productsService.callGetList(limit, page, name).subscribe();
    setTimeout(() => {
      this.loadingService.sendLoadingState(false);
    }, 600);
  }

  handleChange(event: any) {
    this.productId = event.detail.value;
    this.loadImages();
  }

  get products(): Observable<Product[]> {
    return this.productsService.getList();
  }

  private updatePage(value: number): void {
    this.page = value;
  }
}
