export class Photo {

    constructor(
        public id?: string,
        public name?: string,
        public link?: string,
        public image?: string,
        public order?: number,
        public parentId?: string) {
    }

}
