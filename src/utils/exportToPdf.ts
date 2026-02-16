import html2pdf from 'html2pdf.js'

export async function exportToPdf(element: HTMLElement, filename: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opt: any = {
    margin: [10, 10, 10, 10],
    filename: filename.replace(/\.(ya?ml)$/i, '') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  await html2pdf().set(opt).from(element).save()
}
