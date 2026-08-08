import { createRouter, createWebHashHistory } from 'vue-router';
import { supabase } from '@/lib/supabase';

// Hash history: evita 404 sul caricamento diretto delle rotte in GitHub Pages.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'map',
      component: () => import('@/views/MapView.vue'),
    },
    {
      path: '/luogo/:id',
      name: 'place',
      component: () => import('@/views/PlaceDetail.vue'),
      props: true,
    },
    {
      path: '/segnala',
      name: 'submit',
      component: () => import('@/views/SubmitView.vue'),
    },
    {
      path: '/progetto',
      name: 'project',
      component: () => import('@/views/ProjectView.vue'),
    },
    {
      path: '/chi-siamo',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/obiettivi',
      name: 'goals',
      component: () => import('@/views/GoalsView.vue'),
    },
    {
      path: '/diventa-revisore',
      name: 'reviewer',
      component: () => import('@/views/ReviewerView.vue'),
    },
    {
      path: '/contribuisci',
      name: 'contribute',
      component: () => import('@/views/ContribuisciView.vue'),
    },
    {
      path: '/moderazione',
      name: 'moderation',
      component: () => import('@/views/ModerationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/accedi',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

// Protegge l'area di moderazione: senza sessione rimanda al login.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  return { name: 'login', query: { redirect: to.fullPath } };
});

export default router;
