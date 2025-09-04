import { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import './BarcodePrintSheet.css';
import React from 'react';
const BarcodePrintSheet = () => {
  const [labels, setLabels] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const queueData = localStorage.getItem('barcodePrintQueue');
    if (queueData) {
      const queue = JSON.parse(queueData);
      const allLabels = queue.flatMap(item =>
        Array.from({ length: item.printQty }, () => item)
      );
      setLabels(allLabels);
      
      // Split labels into pages (36 labels per page)
      const labelsPerPage = 36;
      const pages = [];
      for (let i = 0; i < allLabels.length; i += labelsPerPage) {
        pages.push(allLabels.slice(i, i + labelsPerPage));
      }
      setPages(pages);
    }
  }, []);

  useEffect(() => {
    if (labels.length > 0) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [labels]);

  return (
    <>
      <div className="no-print">
        Halaman ini akan otomatis membuka dialog cetak. Jika tidak, tekan Ctrl+P.
      </div>
      
      {pages.map((pageLabels, pageIndex) => (
        <div key={pageIndex} className="a4-sheet">
          <div className="label-grid">
            {pageLabels.map((label, index) => (
              <div key={`${pageIndex}-${index}`} className="barcode-label">
                <p className="product-name">{label.name}</p>
                {label.price && (
                  <p className="product-price">Rp {label.price.toLocaleString('id-ID')}</p>
                )}
                <Barcode 
                  value={label.barcode || 'NO_BARCODE'}
                  renderer="canvas"
                  height={20}
                  width={1.2}
                  fontSize={10}
                  margin={2}
                  textMargin={0}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default BarcodePrintSheet;