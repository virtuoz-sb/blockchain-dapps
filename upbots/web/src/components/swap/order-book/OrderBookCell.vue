<template functional>
  <div class="flex items-center mb-15 last:mb-0">
    <span class="table__col-1 lg:w-full text-grey-cl-920 leading-xs text-left lg:text-left">{{ props.data.dex }}</span>
    <span class="table__col-2 lg:w-full text-grey-cl-920 leading-xs text-center lg:text-left">{{ props.data.price }}</span>
    <span class="table__col-3 lg:w-full text-grey-cl-920 leading-xs text-right lg:text-left">{{ props.data.volume }}</span>
  </div>
</template>

<style lang="scss" scoped>
.table {
  &__col-1 {
    max-width: 127px;
    @media (max-width: 1279px) {
      max-width: 80px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
  &__col-2 {
    max-width: 140px;
    @media (max-width: 1279px) {
      max-width: 120px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
  &__col-3 {
    max-width: 140px;
    @media (max-width: 1279px) {
      max-width: 120px;
    }
    @media (max-width: 1024px) {
      @apply max-w-full w-1/3;
    }
  }
}
</style>
