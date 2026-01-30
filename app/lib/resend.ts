import { Resend } from "resend";
import { CREDENTIALS } from "./constants";

export const resend = new Resend(CREDENTIALS.resend_api_key);
