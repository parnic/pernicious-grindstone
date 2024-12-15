export class html {
    static showOrHideElement(elem: HTMLElement, show: boolean) {
        if (show) {
            this.showElement(elem);
            return;
        }

        this.hideElement(elem);
    }

    static unhideOrHideElement(elem: HTMLElement, show: boolean) {
        if (show) {
            this.showElement(elem);
        }

        this.unhideElement(elem);
    }

    // adds the 'show' class to an element (which is "display: block") and removes the 'hide' class
    static showElement(elem: HTMLElement) {
        this.unhideElement(elem);
        elem.classList.add('show');
    }

    // removes the 'hide' class from an element
    static unhideElement(elem: HTMLElement) {
        elem.classList.remove('hide');
    }

    // adds the 'hide' class from an element and removes the 'show' class if it exists
    static hideElement(elem: HTMLElement) {
        elem.classList.remove('show');
        elem.classList.add('hide');
    }
}
