import { useState, useEffect } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import type { Client, CreateClientDTO, UpdateClientDTO } from "@/types/types";
import { FaClipboardList } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

interface ClientFormModalProps {
  isOpen: boolean;
  client?: Client | null;
  onClose: () => void;
  onSubmit: (data: CreateClientDTO | UpdateClientDTO) => Promise<void>;
}

export function ClientFormModal({
  isOpen,
  client,
  onClose,
  onSubmit,
}: ClientFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    cuil: "",
    tax_condition: "" as "responsable_inscripto" | "monotributo" | "",
    phone: "",
    email: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        cuil: client.cuil,
        tax_condition: client.tax_condition,
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
      });
    } else {
      setFormData({
        name: "",
        cuil: "",
        tax_condition: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const dataToSubmit: any = {
        name: formData.name.trim(),
        cuil: formData.cuil.trim(),
        tax_condition: formData.tax_condition,
      };

      if (formData.phone.trim()) dataToSubmit.phone = formData.phone.trim();
      if (formData.email.trim()) dataToSubmit.email = formData.email.trim();
      if (formData.address.trim())
        dataToSubmit.address = formData.address.trim();

      await onSubmit(dataToSubmit);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      cuil: "",
      tax_condition: "",
      phone: "",
      email: "",
      address: "",
    });
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const isEdit = !!client;
  const isFormValid = !!(
    formData.name.trim() &&
    formData.cuil.trim() &&
    formData.tax_condition
  );

  return (
    <FormLayout
      title={isEdit ? "Editar cliente" : "Nuevo cliente"}
      description={
        isEdit ? `Modificar: ${client.name}` : "Registrar un nuevo cliente"
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Guardar cambios" : "Crear cliente"}
      isSubmitting={isSubmitting}
      isValid={isFormValid}
    >
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-[#0F172A] border-b-2 border-[#E2E8F0] pb-3 flex items-center gap-2">
          <FaClipboardList className="text-xl" /> Datos obligatorios
        </h3>

        <Input
          id="client-name"
          label="Nombre completo *"
          type="text"
          placeholder="Ej: Juan Perez"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          autoFocus
        />

        <Input
          id="client-cuil"
          label="CUIL *"
          type="text"
          placeholder="Ej: 20-12345678-9"
          value={formData.cuil}
          onChange={(e) => handleChange("cuil", e.target.value)}
          required
        />

        <div>
          <label
            htmlFor="client-tax"
            className="block text-[#0F172A] text-lg font-semibold mb-2"
          >
            Condicion fiscal *
          </label>
          <select
            id="client-tax"
            value={formData.tax_condition}
            onChange={(e) => handleChange("tax_condition", e.target.value)}
            required
            className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
          >
            <option value="">Seleccione una opcion</option>
            <option value="responsable_inscripto">Responsable Inscripto</option>
            <option value="monotributo">Monotributo</option>
          </select>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-bold text-[#64748B] border-b-2 border-[#E2E8F0] pb-3 flex items-center gap-2">
          <FaEdit className="text-xl" /> Datos opcionales
        </h3>

        <Input
          id="client-phone"
          label="Telefono"
          type="tel"
          placeholder="Ej: 011 1234-5678"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />

        <Input
          id="client-email"
          label="Correo electronico"
          type="email"
          placeholder="Ej: cliente@ejemplo.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <Input
          id="client-address"
          label="Direccion"
          type="text"
          placeholder="Ej: Av. Principal 123"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>
    </FormLayout>
  );
}
