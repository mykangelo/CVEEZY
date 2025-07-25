import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'; // Tailwind entry

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.tsx');
    return pages[`./Pages/${name}.tsx`]();
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
