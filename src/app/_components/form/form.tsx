import { createFormHook } from "@tanstack/react-form";
import CheckboxField from "./checkbox-field";
import { fieldContext, formContext } from "./contexts";
import Dropdown from "./dropdown";
import NumberField from "./number-field";
import PropertyField from "./property-field";
import SubmitButton from "./submit-button";
import TextField from "./text-field";
import WysiwygField from "./wysiwyg-field";

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    CheckboxField,
    WysiwygField,
    PropertyField,
    Dropdown,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export default useAppForm;
