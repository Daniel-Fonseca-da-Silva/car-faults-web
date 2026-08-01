import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommentForm } from "./comment-form";

const uploadCommentImageMock = jest.fn();

jest.mock("@/lib/api/storage", () => ({
  uploadCommentImage: (...args: unknown[]) =>
    uploadCommentImageMock(...args),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      "vehicle.comments.placeholder": "Escreve um comentário...",
      "vehicle.comments.addImage": "Adicionar foto",
      "vehicle.comments.removeImage": "Remover foto",
      "vehicle.comments.imageAlt": "Foto do concerto",
      "vehicle.comments.cancel": "Cancelar",
      "vehicle.comments.publishing": "A publicar...",
      "vehicle.comments.invalidImageType": "Formato de imagem não suportado.",
      "vehicle.comments.imageTooLarge": "A imagem excede o limite de 5 MB.",
      "vehicle.comments.submitError":
        "Não foi possível publicar o comentário.",
    };
    return dict[key] ?? key;
  },
}));

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:mock-preview");
  global.URL.revokeObjectURL = jest.fn();
});

describe("CommentForm", () => {
  afterEach(() => {
    uploadCommentImageMock.mockReset();
  });

  it("disables the submit button while the body is empty", () => {
    render(<CommentForm submitLabel="Publicar" onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
  });

  it("submits the trimmed body with no imageUrl when no file is attached", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CommentForm submitLabel="Publicar" onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Escreve um comentário..."),
      "  Had the same issue  "
    );
    await user.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        body: "Had the same issue",
        imageUrl: undefined,
      });
    });
  });

  it("submits with Ctrl+Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CommentForm submitLabel="Publicar" onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText("Escreve um comentário...");
    await user.type(textarea, "Had the same issue");
    await user.type(textarea, "{Control>}{Enter}{/Control}");

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        body: "Had the same issue",
        imageUrl: undefined,
      });
    });
  });

  it("rejects an unsupported file type", () => {
    render(<CommentForm submitLabel="Publicar" onSubmit={jest.fn()} />);

    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByText("Formato de imagem não suportado.")
    ).toBeInTheDocument();
    expect(uploadCommentImageMock).not.toHaveBeenCalled();
  });

  it("rejects a file over the size limit", async () => {
    const user = userEvent.setup();
    render(<CommentForm submitLabel="Publicar" onSubmit={jest.fn()} />);

    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, bigFile);

    expect(
      screen.getByText("A imagem excede o limite de 5 MB.")
    ).toBeInTheDocument();
  });

  it("uploads the selected image and submits with the returned url", async () => {
    const user = userEvent.setup();
    uploadCommentImageMock.mockResolvedValue({
      url: "https://cdn.example.com/comments/user-1/uuid.jpg",
    });
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CommentForm submitLabel="Publicar" onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Escreve um comentário..."),
      "Had the same issue"
    );
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, file);

    expect(screen.getByAltText("Foto do concerto")).toHaveAttribute(
      "src",
      "blob:mock-preview"
    );

    await user.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(uploadCommentImageMock).toHaveBeenCalledWith(file);
      expect(onSubmit).toHaveBeenCalledWith({
        body: "Had the same issue",
        imageUrl: "https://cdn.example.com/comments/user-1/uuid.jpg",
      });
    });
  });

  it("removes the existing image and submits imageUrl null", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <CommentForm
        submitLabel="Guardar"
        initialBody="Updated body"
        initialImageUrl="https://cdn.example.com/comments/user-1/old.jpg"
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByAltText("Foto do concerto")).toHaveAttribute(
      "src",
      "https://cdn.example.com/comments/user-1/old.jpg"
    );

    await user.click(
      screen.getByRole("button", { name: "Remover foto" })
    );
    expect(screen.queryByAltText("Foto do concerto")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        body: "Updated body",
        imageUrl: null,
      });
    });
    expect(uploadCommentImageMock).not.toHaveBeenCalled();
  });

  it("shows an inline error and re-enables the form when submit fails", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockRejectedValue(new Error("network error"));
    render(<CommentForm submitLabel="Publicar" onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("Escreve um comentário..."),
      "Had the same issue"
    );
    await user.click(screen.getByRole("button", { name: "Publicar" }));

    expect(
      await screen.findByText("Não foi possível publicar o comentário.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Publicar" })
    ).not.toBeDisabled();
  });

  it("calls onCancel when the cancel button is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <CommentForm
        submitLabel="Guardar"
        initialBody="Updated body"
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
