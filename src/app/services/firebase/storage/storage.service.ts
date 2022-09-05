import { Injectable } from '@angular/core';
import { app } from '../index';
import {
  FirebaseStorage,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
  UploadResult,
  getDownloadURL,
} from 'firebase/storage';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: FirebaseStorage = getStorage(app);
  private rootRef: StorageReference = ref(this.storage);

  constructor() {}

  /**
   * @param file upload file
   * @param uid  user uid
   * @param type user, vehicle, lpn
   * @param index id of the vehicle
   */
  async upload(
    file: File,
    uid: string,
    type: string,
    index?: number
  ): Promise<string> {
    file = this.modifyFilename(file, type);
    const blob: ArrayBuffer = await file?.arrayBuffer();
    const storageRef = this.getRef(uid, type, file, index);
    const uploadResult: UploadResult = await uploadBytes(storageRef, blob);
    const url: string = await this.getFileUrl(uploadResult.ref.fullPath);
    return url;
  }

  private modifyFilename(file: File, type: string): File {
    const ext: string = file.name.substring(file.name.lastIndexOf('.'));
    file = new File([file], `${type}${ext}`, { type: file.type });
    return file;
  }

  private async getFileUrl(refPath: string): Promise<string> {
    const url: string = await getDownloadURL(ref(this.storage, refPath));
    return url;
  }

  private getRef(
    uid: string,
    type: string,
    file: File,
    index?: number
  ): StorageReference {
    let refPath: string;
    if (type == 'vehicle' || type == 'lpn') {
      refPath = `${uid}/${index!}/${file.name}`;
    } else {
      refPath = `${uid}/${file.name}`;
    }
    return ref(this.rootRef, refPath);
  }
}

// remove(): string {}
