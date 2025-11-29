import { jsPDF } from "jspdf";

export const exportService = {
    downloadTXT: (content: string, filename: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${filename}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    downloadPDF: (content: string, filename: string) => {
        const doc = new jsPDF();

        // Header / Branding
        doc.setFillColor(185, 54, 50); // Verax Red
        doc.rect(0, 0, 210, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Estudio Verax", 10, 13);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Análisis y Cierre de Siniestros", 150, 13);

        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);

        const splitText = doc.splitTextToSize(content, 180);
        let y = 35;

        // Simple pagination handling
        for (let i = 0; i < splitText.length; i++) {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(splitText[i], 15, y);
            y += 7;
        }

        doc.save(`${filename}.pdf`);
    }
};
