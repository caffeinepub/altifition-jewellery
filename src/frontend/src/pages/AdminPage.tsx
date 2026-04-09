import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useGetProducts,
  useIsCallerAdmin,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORIES = ["Rings", "Necklaces", "Earrings"];

interface ProductFormState {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  imageUrl: "",
  category: "Rings",
};

function AdminLoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-jet flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-sm shadow-card p-12 max-w-md w-full text-center"
      >
        <h1 className="font-display text-3xl font-bold text-jet mb-2">
          Altifition Admin
        </h1>
        <div className="w-12 h-0.5 bg-gold mx-auto mb-6" />
        <p className="font-body text-muted-foreground mb-8">
          Sign in to manage your jewellery collection.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="btn-gold w-full py-3 rounded-sm text-sm border-0 cursor-pointer"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
              in&hellip;
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </>
          )}
        </Button>
        <div className="mt-6">
          <Link
            to="/"
            className="font-body text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            &larr; Back to website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function AccessDenied() {
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  return (
    <div className="min-h-screen bg-jet flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-sm shadow-card p-12 max-w-md w-full text-center">
        <h2 className="font-display text-2xl font-bold text-jet mb-4">
          Access Denied
        </h2>
        <p className="font-body text-muted-foreground mb-8">
          You do not have administrator privileges.
        </p>
        <Button
          onClick={() => {
            clear();
            qc.clear();
          }}
          variant="outline"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
        <div className="mt-4">
          <Link
            to="/"
            className="font-body text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            &larr; Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { identity, loginStatus, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === "logging-in";

  const { data: products, isLoading: productsLoading } = useGetProducts();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (isInitializing) {
    return (
      <div
        className="min-h-screen bg-jet flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="text-gold w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <AdminLoginPrompt />;

  if (adminLoading) {
    return (
      <div
        className="min-h-screen bg-jet flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="text-gold w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <AccessDenied />;

  function openAddForm() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    setFormOpen(true);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setUploadProgress(pct),
    );
    const url = blob.getDirectURL();
    setForm((prev) => ({ ...prev, imageUrl: url }));
    setUploadProgress(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...form });
        toast.success("Product updated successfully");
      } else {
        await addProduct.mutateAsync(form);
        toast.success("Product added successfully");
      }
      setFormOpen(false);
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f4] flex flex-col">
      {/* Admin Header */}
      <header className="bg-jet">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-gold">
              Altifition Admin
            </h1>
            <p className="font-body text-white/50 text-xs">
              Product Management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              data-ocid="admin.back.link"
              className="font-body text-white/60 text-sm flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
            <button
              type="button"
              onClick={() => {
                clear();
                qc.clear();
              }}
              className="font-body text-white/60 text-sm flex items-center gap-1.5 hover:text-gold transition-colors ml-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        {/* Gold accent bar */}
        <div className="h-1 bg-gold" />
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-jet">
              Products
            </h2>
            <p className="font-body text-muted-foreground text-sm mt-1">
              {products?.length ?? 0} items in your collection
            </p>
          </div>
          <Button
            type="button"
            onClick={openAddForm}
            data-ocid="admin.add_product.button"
            className="btn-gold border-0 flex items-center gap-2 py-2.5 px-6 rounded-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {productsLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="admin.products.loading_state"
          >
            <Loader2 className="text-gold w-8 h-8 animate-spin" />
          </div>
        ) : !products || products.length === 0 ? (
          <div
            data-ocid="admin.products.empty_state"
            className="text-center py-20"
          >
            <p className="font-display italic text-2xl text-muted-foreground">
              No products yet.
            </p>
            <p className="font-body text-muted-foreground mt-2">
              Click &ldquo;Add Product&rdquo; to create your first item.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-sm shadow-card overflow-hidden">
            <table className="w-full" data-ocid="admin.products.table">
              <thead className="bg-jet text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-body font-semibold text-xs tracking-widest uppercase text-gold w-20">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left font-body font-semibold text-xs tracking-widest uppercase text-gold">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-body font-semibold text-xs tracking-widest uppercase text-gold hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-body font-semibold text-xs tracking-widest uppercase text-gold hidden lg:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center font-body font-semibold text-xs tracking-widest uppercase text-gold w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product, i) => (
                  <tr
                    key={String(product.id)}
                    data-ocid={`admin.products.row.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-jet to-[#2a2218] rounded-sm flex items-center justify-center">
                          <span className="text-gold text-xs font-semibold">
                            {product.category[0]}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body font-semibold text-jet">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground hidden md:table-cell">
                      <span className="bg-gold/10 text-gold-dark border border-gold/20 rounded-full px-3 py-0.5 text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-2">
                        {product.description}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          data-ocid={`admin.product.edit_button.${i + 1}`}
                          className="p-2 rounded-sm hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          data-ocid={`admin.product.delete_button.${i + 1}`}
                          className="p-2 rounded-sm hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => !isSaving && setFormOpen(open)}
      >
        <DialogContent className="max-w-lg" data-ocid="admin.product.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-jet">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="prod-name"
                className="font-body font-semibold text-xs uppercase tracking-wider text-muted-foreground"
              >
                Product Name
              </Label>
              <Input
                id="prod-name"
                data-ocid="admin.product.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Diamond Solitaire Ring"
                className="font-body"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="prod-desc"
                className="font-body font-semibold text-xs uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="prod-desc"
                data-ocid="admin.product.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe this piece..."
                rows={3}
                className="font-body resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-body font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger
                  data-ocid="admin.product.category.select"
                  className="font-body"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-body">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-body font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Product Image
              </Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="image-upload"
                  data-ocid="admin.product.image.upload_button"
                  className="btn-gold cursor-pointer inline-flex items-center gap-2 py-2 px-4 rounded-sm text-xs font-body"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {uploadProgress !== null
                    ? `Uploading ${uploadProgress}%`
                    : "Upload Image"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="w-12 h-12 object-cover rounded-sm border border-border"
                  />
                )}
              </div>
              {!form.imageUrl && (
                <p className="font-body text-xs text-muted-foreground">
                  Or paste an image URL:
                </p>
              )}
              {!form.imageUrl && (
                <Input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  className="font-body text-sm"
                />
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.product.form.cancel_button"
              onClick={() => setFormOpen(false)}
              disabled={isSaving}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.product.save.submit_button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-gold border-0 cursor-pointer font-body"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Saving&hellip;
                </>
              ) : editingProduct ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.confirm.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-jet">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Are you sure you want to delete &ldquo;
              <strong>{deleteTarget?.name}</strong>&rdquo;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.confirm.cancel_button"
              className="font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.confirm.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
