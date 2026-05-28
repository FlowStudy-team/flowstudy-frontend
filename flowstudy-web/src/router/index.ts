import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import AppShell from '../layouts/AppShell.vue'
import ArticleReaderLayout from '../layouts/ArticleReaderLayout.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ArticleDetailView from '../views/articles/ArticleDetailView.vue'
import ChapterDetailView from '../views/articles/ChapterDetailView.vue'
import ProblemDetailView from '../views/problems/ProblemDetailView.vue'
import ProfileHomeView from '../views/profile/ProfileHomeView.vue'
import SubmissionListView from '../views/profile/SubmissionListView.vue'
import HomeView from '../views/home/HomeView.vue'
import ForbiddenView from '../views/system/ForbiddenView.vue'
import NotFoundView from '../views/system/NotFoundView.vue'
import ServerErrorView from '../views/system/ServerErrorView.vue'
import { useAuthStore } from '../store/modules/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
        },
      ],
    },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: 'problems/:problemId', name: 'problem-detail', component: ProblemDetailView },
        { path: 'me', name: 'profile-home', component: ProfileHomeView },
        { path: 'me/submissions', name: 'profile-submissions', component: SubmissionListView },
      ],
    },
    {
      path: '/articles',
      component: ArticleReaderLayout,
      children: [
        { path: '', name: 'article-detail', component: ArticleDetailView },
        {
          path: 'chapters/:chapterId',
          name: 'chapter-detail',
          component: ChapterDetailView,
        },
      ],
    },
    { path: '/403', name: 'forbidden', component: ForbiddenView },
    { path: '/500', name: 'server-error', component: ServerErrorView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const publicPaths = ['/', '/login', '/register', '/403', '/500']
  const publicPrefixes = ['/articles', '/problems']
  const isAuthPage = to.path === '/login' || to.path === '/register'
  const isPublicPrefix = publicPrefixes.some((prefix) => to.path.startsWith(prefix))
  if (!authStore.isAuthenticated && !publicPaths.includes(to.path) && !isPublicPrefix) {
    return '/login'
  }
  if (authStore.isAuthenticated && isAuthPage) {
    return '/articles'
  }
  return true
})

export default router
