import { Injectable } from '@angular/core';
import { app } from '../index';
import {
  FirebaseStorage,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
} from 'firebase/storage';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: FirebaseStorage = getStorage(app);
  private rootRef: StorageReference = ref(this.storage);

  constructor() {}

  /**
   * @param target input target
   * @param uid  user uid
   */
  async upload(
    target: HTMLInputElement,
    uid: string,
    type: string,
    index?: number
  ): Promise<void> {
    const file: File = target.files?.item(0)!;
    let fileName: string = file.name;
    const blob = await file?.arrayBuffer();
    let refPath: string;
    switch (type) {
      case 'userIdImage': {
        refPath = `${uid}/${fileName}`;
        break;
      }
      case 'vehicleImage': {
        refPath = `${uid}/${index!}/v/${fileName}`;
        break;
      }
      case 'lpnImage': {
        refPath = `${uid}/${index!}/lpn/${fileName}`;
        break;
      }
      default: {
        refPath = uid;
        break;
      }
    }
    const storageRef = ref(this.rootRef, refPath);
    const snapshot = await uploadBytes(storageRef, blob);
    console.log(snapshot);
  }
}

// remove(): string {}
