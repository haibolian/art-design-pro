import { ref, toRaw, type Ref } from 'vue'

type Awaitable<T> = T | Promise<T>
type FormModel = Record<string, any>
type FieldKey<TForm extends FormModel> = Extract<keyof TForm, string>

export interface FormInstanceLike {
  validate?: (...args: any[]) => Promise<boolean>
  reset?: () => void
}

export interface UseFormOptions<TForm extends FormModel> {
  initialValues: TForm
  formRef?: Ref<FormInstanceLike | null | undefined>
  onSubmit?: (values: TForm) => Awaitable<void>
}

const cloneValues = <T>(value: T): T => structuredClone(toRaw(value))

export function useForm<TForm extends FormModel>(options: UseFormOptions<TForm>) {
  const { initialValues, formRef, onSubmit } = options

  const initialSnapshot = cloneValues(initialValues)
  const form = ref<TForm>(cloneValues(initialSnapshot)) as Ref<TForm>

  const getFieldValue = <K extends FieldKey<TForm>>(key: K): TForm[K] => form.value[key]

  const setFieldValue = <K extends FieldKey<TForm>>(key: K, value: TForm[K]): void => {
    form.value[key] = value
  }

  const setFieldsValue = (values: Partial<TForm>): void => {
    Object.assign(form.value, values)
  }

  const reset = (): void => {
    formRef?.value?.reset?.()
    form.value = cloneValues(initialSnapshot)
  }

  const validate = async (): Promise<boolean> => {
    if (!formRef?.value?.validate) {
      return true
    }
    return await formRef.value.validate()
  }

  const submit = async (): Promise<void> => {
    const valid = await validate()
    if (!valid) {
      return
    }
    await onSubmit?.(cloneValues(form.value))
  }

  return {
    form,
    validate,
    reset,
    submit,
    getFieldValue,
    setFieldValue,
    setFieldsValue
  }
}
