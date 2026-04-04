import { jsPDF } from "jspdf";
import type { OrderWithDetails } from "@/types/types";

export function generateRemitoPDF(order: OrderWithDetails) {
  const EMPRESA_NOMBRE = (order as any).branch_name;
  const EMPRESA_DIRECCION = (order as any).branch_address;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("REMITO", pageWidth / 2, y, { align: "center" });
  y += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${EMPRESA_NOMBRE}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  if (EMPRESA_DIRECCION) {
    doc.text(EMPRESA_DIRECCION, pageWidth / 2, y, { align: "center" });
    y += 8;
  }

  const today = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.text(`Fecha: ${today}`, margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Remito #: ${order.id}`, margin, y);
  y += 8;

  const tipoTexto = order.type === "entry" ? "ENTRADA" : "SALIDA";
  doc.text(`Tipo: ${tipoTexto}`, margin, y);
  y += 10;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  if (order.client_name) {
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", margin, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(order.client_name, margin + 5, y);
    y += 10;
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    y += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.text("PRODUCTOS:", margin, y);
  y += 10;

  const colProducto = margin;
  const colCantidad = margin + contentWidth * 0.7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Producto", colProducto, y);
  doc.text("Cantidad", colCantidad, y);
  y += 5;
  y += 5;

  doc.setFont("helvetica", "normal");
  order.items.forEach((item) => {
    const productName = item.product_name.length > 40
      ? item.product_name.substring(0, 37) + "..."
      : item.product_name;

    doc.text(productName, colProducto, y);
    doc.text(String(item.quantity), colCantidad, y);
    y += 7;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 5;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total de Items: ${order.items.length}`, margin, y);
  y += 15;

  doc.setLineWidth(0.3);
  doc.line(margin, y + 20, margin + 80, y + 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Firma", margin, y + 25);

  doc.line(pageWidth - margin - 80, y + 20, pageWidth - margin, y + 20);
  doc.text("Aclaración", pageWidth - margin - 80, y + 25);

  doc.save(`remito_${order.id}_${today.replace(/\//g, "-")}.pdf`);
}
