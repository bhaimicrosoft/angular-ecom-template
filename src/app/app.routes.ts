import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { catalogRedirectGuard } from './core/catalog-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Nova — Premium Electronics',
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
    title: 'Shop All — Nova',
  },
  {
    path: 'category/:categoryId',
    loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
    title: 'Category — Nova',
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/product/product').then((m) => m.ProductPage),
    title: 'Product — Nova',
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
    title: 'Your Cart — Nova',
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist').then((m) => m.Wishlist),
    title: 'Wishlist — Nova',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
    title: 'Checkout — Nova',
  },
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./features/confirmation/confirmation').then((m) => m.Confirmation),
    title: 'Order Confirmed — Nova',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
    title: 'Sign In — Nova',
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup').then((m) => m.Signup),
    title: 'Create Account — Nova',
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account-layout').then((m) => m.AccountLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/account/account-overview').then((m) => m.AccountOverview),
        title: 'Account — Nova',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/account/account-orders').then((m) => m.AccountOrders),
        title: 'Your Orders — Nova',
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/account/account-addresses').then((m) => m.AccountAddresses),
        title: 'Addresses — Nova',
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/account/account-payments').then((m) => m.AccountPayments),
        title: 'Payment Methods — Nova',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/account/account-settings').then((m) => m.AccountSettings),
        title: 'Settings — Nova',
      },
    ],
  },
  {
    path: 'track-order',
    loadComponent: () => import('./features/track-order/track-order').then((m) => m.TrackOrder),
    title: 'Track Order — Nova',
  },
  {
    path: 'gift-cards',
    loadComponent: () => import('./features/gift-cards/gift-cards').then((m) => m.GiftCards),
    title: 'Gift Cards — Nova',
  },
  // Curated catalogue shortcuts (redirect to /catalog with query params).
  {
    path: 'new-arrivals',
    canActivate: [catalogRedirectGuard],
    data: { redirectQuery: { sort: 'newest' } },
    children: [],
  },
  {
    path: 'best-sellers',
    canActivate: [catalogRedirectGuard],
    data: { redirectQuery: { sort: 'rating-desc' } },
    children: [],
  },
  {
    path: 'deals',
    canActivate: [catalogRedirectGuard],
    data: { redirectQuery: { onSale: 'true' } },
    children: [],
  },
  // Data-driven info + legal pages (single reusable component).
  ...(
    [
      ['about', 'About Us'],
      ['careers', 'Careers'],
      ['press', 'Press'],
      ['sustainability', 'Sustainability'],
      ['help', 'Help Center'],
      ['shipping', 'Shipping'],
      ['returns', 'Returns'],
      ['privacy', 'Privacy Policy'],
      ['terms', 'Terms of Service'],
      ['cookies', 'Cookie Policy'],
    ] as const
  ).map(([page, title]) => ({
    path: page,
    loadComponent: () => import('./features/info/info-page').then((m) => m.InfoPage),
    data: { page },
    title: `${title} — Nova`,
  })),
  { path: '**', redirectTo: '' },
];
