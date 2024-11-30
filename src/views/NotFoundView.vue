<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-icon
          size="128"
          color="error"
        >
          mdi-alert-circle
        </v-icon>
        
        <div class="text-h3 mt-4">
          404
        </div>
        
        <div class="text-h5 mt-2">
          Страница не найдена
        </div>
        
        <div class="mt-4">
          <v-btn
            color="primary"
            to="/"
          >
            На главную
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template> 