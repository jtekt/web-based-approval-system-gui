<template>
  <v-container class="text-center mt-16">
    <div class="text-h1 mb-4">404</div>
    <div class="text-h5 mb-8">{{ $t('Page not found') }}</div>
    <v-btn color="primary" :to="{ name: 'submitted_applications' }">
      {{ $t('Go home') }}
    </v-btn>
  </v-container>
</template>
