import {
  Button,
  Cursor,
  Frame,
  Input,
  Modal,
  TitleBar,
  Alert,
} from "@react95/core";
import { useModal } from "@react95/core";
import { Divider } from "@react95/core/ListDivider";
import z from "zod";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import docChatIcon from "/docchat-icon.svg";
import { useAuthStore } from "../store/useAuthStore";

const AUTH_MODAL = "auth-modal" as const;
const modalIcon = (
  <img src={docChatIcon} alt="DocChat Icon" width="16" height="16" />
);

const emailSchema = z.string().email("Please enter a valid email address");

export default function AuthForm() {
  const { remove, minimize, focus } = useModal();
  const [alertError, setAlertError] = useState<string | null>(null);
  const { closeWindow, setUserEmail } = useAuthStore();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const res = emailSchema.safeParse(value.email);
      if (!res.success) {
        setAlertError(res.error.issues[0].message);
        return;
      }
      setAlertError(null);
      setUserEmail(value.email);
    },
  });

  const handleCloseAuthModal = () => {
    form.reset();
    setAlertError(null);
    minimize(AUTH_MODAL);
    remove(AUTH_MODAL);
    closeWindow();
  };

  const handleMinimizeAuthModal = () => {
    minimize(AUTH_MODAL);
    focus("no-id");
  };

  return (
    <Frame>
      {alertError && (
        <Alert
          id="error-alert"
          type="error"
          title="Error"
          hasSound
          hasWindowButton
          message={alertError}
          onClose={() => setAlertError(null)}
          titleBarOptions={[
            <TitleBar.Close key="close" onClick={() => setAlertError(null)} />,
          ]}
          buttons={[{ value: "OK", onClick: () => setAlertError(null) }]}
        />
      )}

      <Modal
        id={AUTH_MODAL}
        className={alertError ? "pointer-events-none select-none" : ""}
        icon={modalIcon}
        title="DocChat - Sign-in"
        dragOptions={{
          defaultPosition: {
            x: 50,
            y: 100,
          },
          onDragStart: () => {
            document.body.classList.add("dragging");
          },
          onDragEnd: () => {
            document.body.classList.remove("dragging");
          },
        }}
        titleBarOptions={[
          <TitleBar.Minimize
            key="minimize"
            className={Cursor.Pointer}
            onClick={handleMinimizeAuthModal}
          />,
          <TitleBar.Close
            key="close"
            className={Cursor.Pointer}
            onClick={handleCloseAuthModal}
          />,
        ]}
      >
        <Modal.Content width="330px">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <h4 className="font-bold text-sm text-gray-900 mb-1">
              DocChat v1.0
            </h4>
            <p className="text-xs text-gray-600 leading-normal mb-2">
              Welcome to DocChat — your AI assistant for navigating documents.
              To get started, please enter your email address to connect to the
              assistant.
            </p>

            <Divider className="list-none my-3" />

            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Enter your email to connect:
            </label>

            <form.Field name="email">
              {(field) => (
                <Input
                  className="w-full"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="name@example.com"
                />
              )}
            </form.Field>

            <Frame className="flex gap-2 justify-end mt-4">
              <Button
                disabled={!!alertError}
                className={Cursor.Pointer}
                type="submit"
              >
                Sign in
              </Button>
              <Button
                type="button"
                disabled={!!alertError}
                className={Cursor.Pointer}
                onClick={handleCloseAuthModal}
              >
                Cancel
              </Button>
            </Frame>
          </form>
        </Modal.Content>
      </Modal>
    </Frame>
  );
}
