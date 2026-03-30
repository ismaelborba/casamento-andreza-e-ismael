"use client";

import { ArrowDown, ArrowUp, GripVertical, ImagePlus, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { centsToBRL } from "@/src/lib/money";
import {
  AdminEmptyState,
  formatStatusLabel,
  statusClassName,
} from "@/src/components/sections/admin/admin-ui";
import {
  showAdminGiftReorderedToast,
  showAdminGiftReorderErrorToast,
} from "@/src/components/sections/admin/admin-gifts-toast";

type GiftRow = {
  id: string;
  displayOrder: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  totalQuantity: number;
  purchasedQuantity: number;
  reservedQuantity: number;
  active: boolean;
};

type Props = {
  initialRows: GiftRow[];
};

type DropPlacement = "before" | "after";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  imageUrl: "",
  priceCents: 15000,
  totalQuantity: 1,
  active: true,
};

function availableQuantity(row: GiftRow) {
  return Math.max(0, row.totalQuantity - row.purchasedQuantity - row.reservedQuantity);
}

function progressValue(row: GiftRow) {
  if (!row.totalQuantity) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(((row.purchasedQuantity + row.reservedQuantity) / row.totalQuantity) * 100),
  );
}

function normalizeMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function reorderGiftRows(
  rows: GiftRow[],
  movingId: string,
  targetId: string,
  placement: DropPlacement,
) {
  if (movingId === targetId) {
    return rows;
  }

  const movingRow = rows.find((row) => row.id === movingId);

  if (!movingRow) {
    return rows;
  }

  const remainingRows = rows.filter((row) => row.id !== movingId);
  const targetIndex = remainingRows.findIndex((row) => row.id === targetId);

  if (targetIndex === -1) {
    return rows;
  }

  const insertIndex = placement === "after" ? targetIndex + 1 : targetIndex;
  const nextRows = [...remainingRows];
  nextRows.splice(insertIndex, 0, movingRow);
  return nextRows;
}

export function AdminGiftsManager({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; placement: DropPlacement } | null>(
    null,
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editing = Boolean(form.id);

  async function refresh() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/gifts", { cache: "no-store" });
      const json = await response.json();
      setRows(json.rows ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving && !uploadingImage) {
        setIsFormOpen(false);
        setForm(emptyForm);
        setFeedback(null);
        setError(null);
        setDragActive(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, saving, uploadingImage]);

  useEffect(() => {
    function handleCreateRequest() {
      setForm(emptyForm);
      setFeedback(null);
      setError(null);
      setDragActive(false);
      setIsFormOpen(true);
    }

    window.addEventListener("admin:gifts-create-open", handleCreateRequest);
    return () => window.removeEventListener("admin:gifts-create-open", handleCreateRequest);
  }, []);

  const summary = useMemo(() => {
    return rows.reduce(
      (accumulator, row) => {
        accumulator.active += row.active ? 1 : 0;
        accumulator.inactive += row.active ? 0 : 1;
        accumulator.available += availableQuantity(row);
        return accumulator;
      },
      { active: 0, inactive: 0, available: 0 },
    );
  }, [rows]);

  function fillForm(row: GiftRow) {
    setFeedback(null);
    setError(null);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      imageUrl: row.imageUrl ?? "",
      priceCents: row.priceCents,
      totalQuantity: row.totalQuantity,
      active: row.active,
    });
    setIsFormOpen(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setFeedback(null);
    setError(null);
    setDragActive(false);
  }

  function closeFormModal() {
    if (saving || uploadingImage) {
      return;
    }

    setIsFormOpen(false);
    resetForm();
  }

  async function uploadImage(file: File) {
    setUploadingImage(true);
    setError(null);
    setFeedback(null);

    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch("/api/admin/gifts/upload", {
        method: "POST",
        body: payload,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.error ?? "Não foi possível enviar a imagem.");
      }

      setForm((current) => ({ ...current, imageUrl: json.url ?? "" }));
      setFeedback("Imagem enviada com sucesso.");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Não foi possível enviar a imagem.";
      setError(message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileSelection(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    void uploadImage(file);
  }

  const previewImage = form.imageUrl || null;
  const formReady = Boolean(form.name.trim() && form.priceCents > 0 && form.totalQuantity > 0);

  async function handleSubmit() {
    setSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/gifts", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: form.id } : {}),
          name: form.name,
          description: form.description || null,
          imageUrl: form.imageUrl || null,
          priceCents: Number(form.priceCents),
          totalQuantity: Number(form.totalQuantity),
          active: Boolean(form.active),
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? json?.error ?? "Não foi possível salvar.");
      }

      setFeedback(editing ? "Presente atualizado com sucesso." : "Presente criado com sucesso.");
      setForm(emptyForm);
      setIsFormOpen(false);
      await refresh();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Não foi possível salvar o presente.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Deseja remover este presente da lista?");

    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/gifts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível remover o presente.");
      }

      if (form.id === id) {
        setForm(emptyForm);
      }

      setFeedback("Presente removido da lista.");
      await refresh();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Não foi possível remover o presente.";
      setError(message);
    }
  }

  async function handleMove(
    id: string,
    nextPosition: number,
    giftName: string,
    previousRows?: GiftRow[],
  ) {
    setMovingId(id);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/gifts/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, position: nextPosition }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? json?.error ?? "Nao foi possivel reordenar.");
      }

      setFeedback("Ordem da lista atualizada.");
      showAdminGiftReorderedToast({ giftName, position: nextPosition });
      await refresh();
    } catch (cause) {
      if (previousRows) {
        setRows(previousRows);
      }

      const message =
        cause instanceof Error ? cause.message : "Nao foi possivel reordenar os presentes.";
      setError(message);
      showAdminGiftReorderErrorToast(message);
    } finally {
      setMovingId(null);
    }
  }

  async function handleDrop(targetId: string, placement: DropPlacement) {
    if (!draggingId || draggingId === targetId || movingId) {
      setDropTarget(null);
      return;
    }

    const previousRows = rows;
    const movingRow = rows.find((row) => row.id === draggingId);
    const nextRows = reorderGiftRows(rows, draggingId, targetId, placement);
    const nextPosition = nextRows.findIndex((row) => row.id === draggingId) + 1;

    if (nextPosition <= 0) {
      setDropTarget(null);
      return;
    }

    setRows(nextRows);
    setDropTarget(null);
    setDraggingId(null);
    await handleMove(draggingId, nextPosition, movingRow?.name ?? "Presente", previousRows);
  }

  return (
    <>
      {isFormOpen ? (
          <div
            className="admin-gift-modal"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeFormModal();
              }
            }}
          >
            <div className="admin-gift-modal-dialog" role="dialog" aria-modal="true">
              <div className="admin-gift-modal-header">
                <div>
                  <span className="admin-card-label">
                    {editing ? "Editar presente" : "Novo presente"}
                  </span>
                  <h3>{editing ? "Atualize os detalhes do presente" : "Cadastrar novo presente"}</h3>
                  <p>
                    Preencha os dados, revise a vitrine e salve quando estiver tudo certo.
                  </p>
                </div>

                <button
                  className="admin-gift-modal-close"
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving || uploadingImage}
                  aria-label="Fechar modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="admin-gift-form-shell">
          <div className="admin-gift-form-main">
            <div className="admin-gift-form-section">
              <div className="admin-gift-form-section-head">
                <span className="admin-gift-step-badge">1</span>
                <div>
                  <h3>Imagem do presente</h3>
                  <p>
                    Arraste a imagem para a area abaixo ou clique para selecionar um arquivo.
                  </p>
                </div>
              </div>

              <div className="admin-gift-upload-layout">
                <div
                  className={`admin-gift-dropzone ${dragActive ? "is-dragging" : ""} ${previewImage ? "has-image" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    handleFileSelection(event.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="admin-gift-file-input"
                    onChange={(event) => handleFileSelection(event.target.files)}
                  />

                  {previewImage ? (
                    <div className="admin-gift-upload-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewImage} alt={form.name || "Preview do presente"} />
                    </div>
                  ) : (
                    <div className="admin-gift-dropzone-empty">
                      <UploadCloud size={26} />
                      <strong>Solte a imagem aqui</strong>
                      <span>JPG, PNG, WEBP ou GIF com até 5 MB.</span>
                    </div>
                  )}

                  <div className="admin-gift-dropzone-actions">
                    <span className="admin-inline-note">
                      {uploadingImage ? "Enviando imagem..." : "Clique ou arraste o arquivo"}
                    </span>
                    <button
                      type="button"
                      className="admin-button-secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <LoaderCircle size={16} className="admin-spin" />
                          Enviando...
                        </>
                      ) : previewImage ? (
                        "Trocar imagem"
                      ) : (
                        "Selecionar imagem"
                      )}
                    </button>
                  </div>
                </div>

                <div className="admin-gift-upload-side">
                  <div className="admin-field">
                    <label htmlFor="gift-image">Ou use uma URL de imagem</label>
                    <input
                      id="gift-image"
                      className="admin-input"
                      value={form.imageUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, imageUrl: event.target.value }))
                      }
                      placeholder="https://... ou URL publica do bucket"
                    />
                  </div>

                  <div className="admin-gift-upload-tips">
                    <div>
                      <ImagePlus size={16} />
                      <span>Imagens verticais ou quadradas costumam funcionar melhor na vitrine.</span>
                    </div>
                    <div>
                      <UploadCloud size={16} />
                      <span>
                        O upload salva a imagem no Cloudflare R2, dentro da pasta <code>casamento/</code>.
                      </span>
                    </div>
                  </div>

                  {previewImage ? (
                    <button
                      type="button"
                      className="admin-button-secondary"
                      onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}
                    >
                      <Trash2 size={16} />
                      Remover imagem
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="admin-gift-form-section">
              <div className="admin-gift-form-section-head">
                <span className="admin-gift-step-badge">2</span>
                <div>
                  <h3>Informações do presente</h3>
                  <p>Defina o título, contexto do presente, valor por cota e quantidade total.</p>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="gift-name">Nome do presente</label>
                  <input
                    id="gift-name"
                    className="admin-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ex.: Cota da lua de mel"
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="gift-description">Descrição</label>
                  <textarea
                    id="gift-description"
                    className="admin-textarea"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Explique para que serve esse presente ou cota."
                  />
                  <span className="admin-inline-note">
                    {form.description.length}/600 caracteres
                  </span>
                </div>

                <div className="admin-form-row admin-form-row-admin-gifts">
                  <div className="admin-field">
                    <label htmlFor="gift-price">Valor por cota</label>
                    <input
                      id="gift-price"
                      className="admin-input"
                      type="text"
                      inputMode="numeric"
                      value={centsToBRL(Number(form.priceCents || 0))}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          priceCents: normalizeMoneyInput(event.target.value),
                        }))
                      }
                    />
                    <span className="admin-inline-note">
                      Equivale a {centsToBRL(Number(form.priceCents || 0))}
                    </span>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="gift-total">Quantidade total</label>
                    <input
                      id="gift-total"
                      className="admin-input"
                      type="number"
                      min={1}
                      value={form.totalQuantity}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          totalQuantity: Number(event.target.value) || 0,
                        }))
                      }
                    />
                    <span className="admin-inline-note">
                      Total de cotas que poderão ser compradas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-gift-form-section">
              <div className="admin-gift-form-section-head">
                <span className="admin-gift-step-badge">3</span>
                <div>
                  <h3>Publicação e resumo</h3>
                  <p>Decida se o item já entra na lista pública e confira o resumo antes de salvar.</p>
                </div>
              </div>

              <div className="admin-gift-form-footer">
                <div className="admin-switch admin-gift-visibility">
                  <div className="admin-switch-copy">
                    <strong>Presente visível na lista pública</strong>
                    <span>
                      Quando desativado, o item continua no admin, mas deixa de aparecer
                      em <code>/gifts</code>.
                    </span>
                  </div>

                  <div className="admin-gift-visibility-controls">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.active}
                      className={`admin-switch-toggle ${form.active ? "is-active" : ""}`}
                      onClick={() =>
                        setForm((current) => ({ ...current, active: !current.active }))
                      }
                    >
                      <span className="admin-switch-toggle-track">
                        <span className="admin-switch-toggle-thumb" />
                      </span>
                      <span className="admin-switch-toggle-label">
                        {form.active ? "Ativo" : "Inativo"}
                      </span>
                    </button>

                    <p className="admin-gift-visibility-hint">
                      {form.active
                        ? "Este presente aparece normalmente para os convidados."
                        : "Este presente fica salvo apenas no admin e não aparece no site."}
                    </p>
                  </div>
                </div>

                <div className="admin-gift-summary-card">
                  <span className="admin-card-label">Resumo rápido</span>
                  <strong>{form.name || "Novo presente"}</strong>
                  <p className="admin-gift-summary-description">
                    {form.description || "Adicione uma descrição curta para ajudar o convidado a entender o presente."}
                  </p>

                  <div className="admin-gift-summary-stats">
                    <div>
                      <span>Cota</span>
                      <strong>{centsToBRL(Number(form.priceCents || 0))}</strong>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>{form.totalQuantity || 0}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{form.active ? "Ativo" : "Inativo"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {feedback ? <p className="admin-form-success">{feedback}</p> : null}
          {error ? <p className="admin-form-error">{error}</p> : null}

          <div className="admin-actions-inline">
            <button
              type="button"
              className="admin-button-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Limpar formulário
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={handleSubmit}
              disabled={saving || uploadingImage || !formReady}
            >
              {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Cadastrar presente"}
            </button>
          </div>
              </div>
            </div>
          </div>
      ) : null}
      <section className="admin-panel">
        <div className="admin-toolbar">
          <div>
            <h2 style={{ margin: 0 }}>Lista de presentes</h2>
            <p style={{ margin: "8px 0 0", color: "var(--admin-muted)" }}>
              {rows.length} itens cadastrados, {summary.active} ativos e {summary.available} cotas
              ainda disponíveis.
            </p>
            <p style={{ margin: "8px 0 0", color: "var(--admin-muted)" }}>
              Arraste os cards para cima ou para baixo para definir a ordem exata da vitrine.
            </p>
          </div>

          <div className="admin-actions-inline">
            <button
              type="button"
              className="admin-button-secondary"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Atualizar lista"}
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <AdminEmptyState>
            Ainda não existem presentes cadastrados. O primeiro item que vocês
            criarem aqui já passa a alimentar a página pública de gifts.
          </AdminEmptyState>
        ) : (
          <div className="admin-gifts-list">
            {rows.map((row, index) => (
              <article
                key={row.id}
                className={`admin-gift-row ${draggingId === row.id ? "is-dragging" : ""} ${dropTarget?.id === row.id ? `is-drop-${dropTarget.placement}` : ""}`}
                onDragOver={(event) => {
                  if (!draggingId || draggingId === row.id || movingId) {
                    return;
                  }

                  event.preventDefault();
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const placement =
                    event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";

                  setDropTarget((current) =>
                    current?.id === row.id && current.placement === placement
                      ? current
                      : { id: row.id, placement },
                  );
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  void handleDrop(
                    row.id,
                    dropTarget?.id === row.id ? dropTarget.placement : "after",
                  );
                }}
              >
                <div className="admin-gift-row-main">
                  <div className="admin-gift-row-head">
                    <div className="admin-gift-row-hero">
                      <div className="admin-gift-row-thumb">
                        {row.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.imageUrl} alt={row.name} />
                        ) : (
                          <span>Sem imagem</span>
                        )}
                      </div>

                      <div>
                        <div className="admin-gift-row-order">
                          <span>PosiÃ§Ã£o {index + 1}</span>
                        </div>
                        <h3 className="admin-gift-row-title">{row.name}</h3>
                        <p className="admin-gift-row-description">
                          {row.description || "Sem descrição cadastrada."}
                        </p>
                      </div>
                    </div>

                    <div className="admin-gift-row-side">
                      <span className={statusClassName(row.active ? "active" : "inactive")}>
                        {formatStatusLabel(row.active ? "active" : "inactive")}
                      </span>
                      <strong className="admin-gift-row-price">{centsToBRL(row.priceCents)}</strong>
                    </div>
                  </div>

                  <div className="admin-gift-row-progress">
                    <div className="admin-gift-row-progress-top">
                      <span>Andamento do presente</span>
                      <strong>{progressValue(row)}%</strong>
                    </div>
                    <div className="admin-progress-bar">
                      <span
                        style={{
                          width:
                            progressValue(row) === 0
                              ? "0%"
                              : `max(${progressValue(row)}%, 12px)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-gift-stats">
                    <div className="admin-gift-stat">
                      <span>Cota</span>
                      <strong>{centsToBRL(row.priceCents)}</strong>
                    </div>
                    <div className="admin-gift-stat">
                      <span>Total</span>
                      <strong>{row.totalQuantity}</strong>
                    </div>
                    <div className="admin-gift-stat">
                      <span>Comprado</span>
                      <strong>{row.purchasedQuantity}</strong>
                    </div>
                    <div className="admin-gift-stat">
                      <span>Reservado</span>
                      <strong>{row.reservedQuantity}</strong>
                    </div>
                    <div className="admin-gift-stat is-highlight">
                      <span>Disponível</span>
                      <strong>{availableQuantity(row)}</strong>
                    </div>
                  </div>
                </div>

                <div className="admin-gift-row-actions">
                  <div
                    className="admin-gift-drag-handle"
                    draggable={movingId !== row.id}
                    onDragStart={(event) => {
                      setDraggingId(row.id);
                      setDropTarget(null);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", row.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTarget(null);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Arrastar ${row.name}`}
                  >
                    <GripVertical size={16} />
                    <span>{movingId === row.id ? "Movendo..." : "Arrastar na lista"}</span>
                  </div>

                  <div className="admin-gift-mobile-reorder">
                    <button
                      type="button"
                      className="admin-button-secondary"
                      onClick={() => handleMove(row.id, Math.max(1, index), row.name, rows)}
                      disabled={index === 0 || movingId === row.id}
                    >
                      <ArrowUp size={16} />
                      Subir
                    </button>
                    <button
                      type="button"
                      className="admin-button-secondary"
                      onClick={() =>
                        handleMove(row.id, Math.min(rows.length, index + 2), row.name, rows)
                      }
                      disabled={index === rows.length - 1 || movingId === row.id}
                    >
                      <ArrowDown size={16} />
                      Descer
                    </button>
                  </div>

                  <div style={{ display: "none" }}>
                    <span className="admin-inline-note">Mover para a posiÃ§Ã£o</span>

                  </div>

                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() => fillForm(row)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="admin-button-secondary"
                    onClick={() => handleDelete(row.id)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
