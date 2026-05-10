import { redirect } from "next/navigation";

/** Fallback if middleware is bypassed — canonical marketing home is `/th`. */
export default function RootRedirectPage() {
  redirect("/th");
}
