import { modalArrangeGuestVisit } from "./modalArrangeGuestVisit/modalArrangeGuestVisit.js"
import { modalFeedbackForm } from "./modalFeedbackForm.js"
import { modalPrivacyPolicy } from "./modalPrivacyPolicy.js"
import { modalPasswordRecovery } from "./modalPasswordRecovery/modalPasswordRecovery.js"

export function modals() {
  modalArrangeGuestVisit()
  modalPasswordRecovery()
}