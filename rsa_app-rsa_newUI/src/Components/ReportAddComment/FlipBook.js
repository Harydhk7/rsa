import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import HTMLFlipBook from "react-pageflip";
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";

import samplePDF from "./sample.pdf";

//pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/`+{pdfjs.version}+`/pdf.worker.js`;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const width = 500;
const height = 224;
var numPages = '';

const Page = React.forwardRef(({ pageNumber }, ref) => {
  return (
    <div ref={ref}>
      <ReactPdfPage pageNumber={pageNumber} width={width} />
      <p> {pageNumber} of {numPages}</p>
    </div>
  );
});


function FlipBook(props) {
  useEffect(()=>{
    if(props && props.url && props.url !== '' && props.url !== undefined)
      setURL(props.url)
    if(props.url === "nourl")
      setURL(samplePDF)
  },[])


  const onDocumentLoadSuccess =(e)=>{
    numPages = e._pdfInfo.numPages
    setPagesNo(Array.from({length: numPages}, (_, i) => i + 1))
    console.log(pagesNo)
  }
  const [url1,setURL] = useState('')
  const [pagesNo,setPagesNo] = useState([0])
  
  return (
    <>{url1 && (
          <Document file={url1} onLoadSuccess={onDocumentLoadSuccess}
          >
            <HTMLFlipBook width={width} height={height}>
              {
                pagesNo && pagesNo.map((i1,i)=>{
                  return(
                  <Page pageNumber={i1} />
                  )}
                )
              }
            </HTMLFlipBook>
          </Document>
        )}
        </>
  );
}
export default FlipBook;
