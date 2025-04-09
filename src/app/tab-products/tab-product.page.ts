import { Component, OnInit } from '@angular/core';
import { ProductsService } from './tab-product.service';
import { finalize, Observable } from 'rxjs';
import { Product } from './tab-product.model';
import { LoadingService } from '../services/loading.service';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { FileService } from '../services/file.service';
const IMAGE_DIR = 'stored-images';


interface LocalFile {
	name: string;
	path: string;
	data: string;
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
		private http: HttpClient,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.getProducts(this.limit, this.page, this.name);
    this.loadFiles();
  }

  async loadFiles() {
		this.images = [];

		const loading = await this.loadingCtrl.create({
			message: 'Loading data...'
		});
		await loading.present();

		Filesystem.readdir({
			path: IMAGE_DIR,
			directory: Directory.Data
		})
			.then(
				(result) => {
					this.loadFileData(result.files.map((x) => x.name));
				},
				async (err) => {
					// Folder does not yet exists!
					await Filesystem.mkdir({
						path: IMAGE_DIR,
						directory: Directory.Data
					});
				}
			)
			.then((_) => {
				loading.dismiss();
			});
	}

  async loadFileData(fileNames: string[]) {
		for (let f of fileNames) {
			const filePath = `${IMAGE_DIR}/${f}`;

			const readFile = await Filesystem.readFile({
				path: filePath,
				directory: Directory.Data
			});

			this.images.push({
				name: f,
				path: filePath,
				data: `data:image/jpeg;base64,${readFile.data}`
			});
		}
	}

  async presentToast(text: any) {
		const toast = await this.toastCtrl.create({
			message: text,
			duration: 3000
		});
		toast.present();
	}

  async selectImage() {
		const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos // Camera, Photos or Prompt!
    });

    if (image) {
      this.saveImage(image)
    }
	}

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
        path: `${IMAGE_DIR}/${fileName}`,
        data: base64Data,
        directory: Directory.Data
    });

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
        const file = await Filesystem.readFile({
            path: photo.path!
        });

        return file.data;
    }
    else {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath!);
        const blob = await response.blob();

        return await this.convertBlobToBase64(blob) as string;
    }
}

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async startUpload(file: LocalFile) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.name);
    this.uploadData(formData);
	}

  async uploadData(formData: FormData) {
    const loading = await this.loadingCtrl.create({
        message: 'Uploading image...',
    });
    await loading.present();

    this.fileService.create(formData).subscribe({
      next: (res: any) => {
        console.log(this.productId);
        console.log(res.image);
        loading.dismiss();
      }
    });

    // Use your own API!
    // const url = 'http://localhost:8888/images/upload.php';

    // this.http.post(url, formData)
    //     .pipe(
    //         finalize(() => {
    //             loading.dismiss();
    //         })
    //     )
    //     .subscribe((res: any) => {
    //         if (res['success']) {
    //             this.presentToast('File upload complete.')
    //         } else {
    //             this.presentToast('File upload failed.')
    //         }
    //     });
}

	async deleteImage(file: LocalFile) {
		await Filesystem.deleteFile({
        directory: Directory.Data,
        path: file.path
    });
    this.loadFiles();
    this.presentToast('File removed.');
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
  }

  get products(): Observable<Product[]> {
    return this.productsService.getList();
  }

  private updatePage(value: number): void {
    this.page = value;
  }

}
