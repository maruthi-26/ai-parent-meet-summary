import toast from "react-hot-toast";

export const useToast = () => {
  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const loading = (message) => toast.loading(message);
  const dismiss = (id) => toast.dismiss(id);
  const promise = (promiseFn, msgs) => toast.promise(promiseFn, msgs);

  const custom = (message, options = {}) => toast(message, options);

  return { success, error, loading, dismiss, promise, custom, toast };
};

export default useToast;
