import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GalleryService } from './gallery.service';
import { UploadService } from '../core/_services/upload.service';
import { Photo } from '../core/_models/photo.model';
import { Subject } from 'rxjs';
import { DATATABLES_CONFIG } from '../core/_configs/datatable-pt-br.config';
import * as firebase from 'firebase';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  addPhotoForm: FormGroup;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();
  gallery: any = [];
  galleryEditImage = {};
  isEditing = false;
  isLoading = true;
  // tslint:disable-next-line:no-input-rename
  @Input('parentId')
  parentId: string;
  photo = new Photo();

  private imageEdit;
  private imageEditRef;
  private infoMsg = { body: '', type: 'info' };
  private link = new FormControl('', Validators.required);
  private name = new FormControl('', Validators.required);
  private order = new FormControl('', Validators.required);

  constructor(private _galleryService: GalleryService, private formBuilder: FormBuilder, elm: ElementRef) {
    // this.addPhotoForm.get('parentId').setValue(elm.nativeElement.getAttribute('parentId'));
  }

  addPhoto(): void {
    this._galleryService.create(this.addPhotoForm.value).then(
      () => {
        this.addPhotoForm.reset();
        this.rerender();
      },
      error => console.error(error)
    );
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.photo = {};
    this.sendInfoMsg('Edição de foto cancelada.', 'warning');
  }

  deletePhoto(photo): void {
    if (window.confirm('Tem certeza que quer deletar este photo?')) {
      this._galleryService.delete(photo.id).then(
        () => {
          UploadService.deleteFile(photo.imageRef).then(
            () => {
              this.sendInfoMsg('Foto apagada com sucesso.', 'success');
              this.getGallery();
              this.rerender();
            },
            error => console.error(error)
          );
        },
        error => console.error(error)
      );
    }
  }

  editPhoto(photo): void {
    if (this.imageEdit) {
      photo.image = this.imageEdit;
      photo.imageRef = this.imageEditRef;
    }

    this._galleryService.update(photo.id, photo).then(
      () => {
        this.isEditing = false;
        this.sendInfoMsg('Foto editada com sucesso.', 'success');
        this.rerender();
      },
      error => console.error(error)
    );
  }

  enableEditing(photo): void {
    this.isEditing = true;
    this.photo = photo;

  }

  getGallery(): void {
    this._galleryService.getData().subscribe(
      data => {
        this.gallery = data;
        this.rerender();
      },
      error => console.error(error),
      () => this.isLoading = false
    );
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngOnInit(): void {
    this.dtOptions = DATATABLES_CONFIG;
    this.getGallery();
  }

  async onFileChange(event): Promise<void> {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {

        const filename = `${UploadService.generateId()}${file.name}`;
        const ref = firebase.storage().ref();
        const storageRef = ref.child(filename);
        storageRef.put(file).then(
          snapshot => {
            snapshot.ref.getDownloadURL().then(
              downloadURL => {
                this.addPhotoForm.get('image').setValue(downloadURL);
                this.addPhotoForm.get('imageRef').setValue(filename);
                this.imageEdit = downloadURL;
                this.imageEditRef = filename;
              },
              error => console.error(error));
          },
          error => console.error(error)
        );
      };
    }
  }

  rerender(): void {
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(
        (dtInstance: DataTables.Api) => {
            // Destroy the table first
          dtInstance.destroy();
          // Call the dtTrigger to rerender again
          this.dtTrigger.next();
        },
        error => console.error(error)
      );
    }
  }

  sendInfoMsg(body, type, time = 3000): void {
    this.infoMsg.body = body;
    this.infoMsg.type = type;
    window.setTimeout(() => this.infoMsg.body = '', time);
  }

}
