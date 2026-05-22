import { redirect } from "next/navigation";

// "/" redireciona automaticamente
export default function rootPage() {
  redirect("/dashboard");
}
