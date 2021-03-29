import { Promise } from 'core-js';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import images from "./images"

class UtilsService {
    constructor() {
    }

    setShape (div, shape) {
        if (shape === 'classic') {
            div.style.cssText = `mask-image: 'none';`;
        } else {
            div.style.cssText = `
                -webkit-mask-image: url(${images[shape]});
                -webkit-mask-size: 83%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: center;
                mask-image:  url(${images[shape]});
                mask-size: 83%;
                mask-repeat: no-repeat;
                mask-position: center;`;
        }
        
    }

    getPngFromHtml(el) {
        return new Promise((resolve, reject) => {
            htmlToImage.toPng(el)
            .then(function (dataUrl) {
                resolve(dataUrl)
          }).catch(function (error) {
              reject(error)
        });
        });
    }

    downloadFromDataUrl(dataUrl) {
        var link = document.createElement('a');
        link.download = 'placa-spotify.png';
        link.href = dataUrl;
        link.click();
    }
    getDataUri(url) {
        return new Promise((resolve) => {
            const image = new Image();
            image.setAttribute('crossOrigin', 'anonymous'); //getting images from external domain
    
            image.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight; 
    
                //next three lines for white background in case png has a transparent background
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';  /// set white fill style
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                canvas.getContext('2d').drawImage(this, 0, 0);
    
                resolve(canvas.toDataURL('image/jpeg'))
            };
    
            image.src = url;
        });
   }

   calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    }
   drawAndDownloadPdf(output = false, pdf_images, song_title, song_artist, shape, type, scale, drawPos) {
        return new Promise((resolve) => {
            const doc = new jsPDF();
            // Setear cuadrado
            doc.setDrawColor(255, 255, 255)
            doc.setFillColor(255, 255, 255)
            doc.roundedRect(25, 5, 160, 286, 2, 2, 'FD')

            // Setear imágenes
            if (type === 'spotify') {
                //40, 25, 130, 130)
                doc.addImage(pdf_images.album_image, 'JPEG',40, 28, 130, 130)
            }
            if (type === 'personal') {
                const imageProps = doc.getImageProperties(pdf_images.custom_images)
                const aspratio = this.calculateAspectRatioFit(imageProps.width, imageProps.height, 130 * parseFloat(scale), 130 * parseFloat(scale))
                const width = aspratio.width
                const height = aspratio.height
                const adjustedScale = 1.3 * parseFloat(scale)
                const adjustedScaleY = 1.1 * parseFloat(scale)
                const x = (doc.internal.pageSize.getWidth() / 2) - (aspratio.width / 2) + (parseFloat(drawPos.left) * adjustedScale)
                const y = 98 - (aspratio.height / 2) + (parseFloat(drawPos.top) * adjustedScaleY)
                doc.addImage(pdf_images.custom_images, 'PNG', x, y, width, height)
                // Fill borders
                doc.setDrawColor(255, 255, 255)
                doc.setFillColor(255, 255, 255)
                doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28,'FD')
                doc.rect(doc.internal.pageSize.getWidth() - 40, 0, 40, 155,'FD')
                doc.rect(0, 0, 40, 155,'FD')
                doc.rect(0, 155, doc.internal.pageSize.getWidth(), 155,'FD')
            }
            if (shape !== 'classic') {
                // 50, 165, 110, 28)
                doc.addImage(pdf_images[shape], 'PNG',40, 28, 130, 130)
            }
            doc.addImage(pdf_images.soundwave, 'JPEG', 50, 166, 110, 28)
            doc.addImage(pdf_images.controls, 'JPEG', 40, 231, 130, 37)
            doc.addImage(pdf_images.like, 'JPEG', 163, 204, 7, 7)

            
            doc.setFont("helvetica", "bold")
            doc.setFontSize(17)
            doc.text(40, 205, song_title)

            doc.setFont("helvetica", "normal")
            doc.text(40, 215, song_artist)
            if (output) {
                return resolve(doc.output('datauristring'));
            } else {
                doc.save('placa-spotify.pdf');
                resolve()
            }
        });
   }
}

export default new UtilsService()