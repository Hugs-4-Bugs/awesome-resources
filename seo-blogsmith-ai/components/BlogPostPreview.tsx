import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, CheckCheck, FileText, FileDown, Printer } from 'lucide-react';

interface Props {
  content: string;
}

const BlogPostPreview: React.FC<Props> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadMD = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-post.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    const element = contentRef.current;
    
    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     'optimized-blog-post.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Access global html2pdf from CDN
    // @ts-ignore
    if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save();
    } else {
        alert("PDF generator is loading. Please try again in a moment.");
    }
  };

  const handleDownloadWord = () => {
    if (!contentRef.current) return;
    
    // Create a complete HTML document with Microsoft Word namespace
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title>" +
            "<style>body { font-family: 'Times New Roman', serif; font-size: 12pt; }</style>" + 
            "</head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + contentRef.current.innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'blog-post.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl shadow-elegant border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-serif">
          <FileText className="w-5 h-5 text-indigo-600" />
          Content Preview
        </h2>
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title="Copy to Clipboard"
            >
                {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

            <button
                onClick={handleDownloadMD}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title="Download Markdown"
            >
                <FileDown className="w-4 h-4" /> MD
            </button>
            <button
                onClick={handleDownloadWord}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                title="Download Word Doc"
            >
                <FileText className="w-4 h-4" /> Word
            </button>
            <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                title="Download PDF"
            >
                <Printer className="w-4 h-4" /> PDF
            </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8 md:p-16 overflow-x-auto bg-white min-h-[600px]" ref={contentRef}>
        <article className="prose prose-slate prose-lg max-w-none markdown-body font-serif mx-auto">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPreview;