import { Resend } from "resend";
import { CREDENTIALS } from "./credentials";

export const resend = new Resend(CREDENTIALS.resend_api_key || "re_placeholder");

