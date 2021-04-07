import { Promise } from 'core-js';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import  images from "./images"

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
                
                const aspratio = this.calculateAspectRatioFit(imageProps.width, imageProps.height, 132 * parseFloat(scale), 1000)
                const width = aspratio.width
                const height = aspratio.height
                const adjustedScale = 1.3 * parseFloat(scale)
                const adjustedScaleY = 1.2 * parseFloat(scale)
                const x = (doc.internal.pageSize.getWidth() / 2) - (aspratio.width / 2) + (parseFloat(drawPos.left) * adjustedScale)
                const y = 92 - (aspratio.height / 2) + (parseFloat(drawPos.top) * adjustedScaleY)
                doc.addImage(pdf_images.custom_images, 'PNG', x, y, width, height)
                // Fill borders
                doc.setDrawColor(255, 255, 255)
                doc.setFillColor(255, 255, 255)
                doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28,'FD')
                doc.rect(doc.internal.pageSize.getWidth() - 40, 0, 40, 158,'FD')
                doc.rect(0, 0, 40, 158,'FD')
                const bottom_rect = {
                    x: 0,
                    y: shape === 'circle' ? 156 : 158,
                    width: doc.internal.pageSize.getWidth(),
                    height: 155
                }
                doc.rect(bottom_rect.x, bottom_rect.y, bottom_rect.width, bottom_rect.height,'FD')
            }
            if (shape !== 'classic') {
                const setShape_loc = {
                    x: 40,
                    y: shape === 'circle' ? 26 : 28,
                    with: 130,
                    height: 130 
                }
                doc.addImage(pdf_images[shape], 'PNG', setShape_loc.x, setShape_loc.y, setShape_loc.with, setShape_loc.height)
            }

            const imgWidth = 490 * doc.internal.pageSize.getWidth() / 793;
            const imgHeight = 143 * doc.internal.pageSize.getWidth() / 793;
            doc.addImage(pdf_images.controls, 'JPEG', 40, 231, imgWidth, imgHeight)
            doc.addImage(pdf_images.like, 'JPEG', 163, 204, 7, 7)

            
            doc.setFont("helvetica", "bold")
            doc.setFontSize(17)
            let long_title = song_title.length > 40 ? 3 : 0
            let long_artist = song_artist.length > 40 ? 3 : 0
            if (long_title) {
                doc.text(40, 200 - long_artist, song_title.substring(0, 40))
                if (song_title.length > 76)  doc.text(40, 208 - long_artist, song_title.substring(40, 76) + '...')
                else doc.text(40, 208 - long_artist, song_title.substring(40, 76))
            } else {
                doc.text(40, 205 - long_artist, song_title.substring(0, 40))
            }

            doc.addImage(pdf_images.soundwave, 'JPEG', 50, 166 - long_title - long_artist, 110, 28)

            doc.setFont("helvetica", "normal")
            if (long_artist) {
                doc.text(40, 210 + long_title, song_artist.substring(0, 40))
                if (song_artist.length > 78)  doc.text(40, 217 + long_title, song_artist.substring(40, 78) + '...')
                else doc.text(40, 217 + long_title, song_artist.substring(40, 78))
            } else {
                doc.text(40, 215 + long_title, song_artist)
            }
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