<script setup>

import { onMounted } from 'vue'
import { budgetApi } from '@/services/apiBudget'

onMounted(async () => {

    try {

        // const response = await budgetApi.getBudgets()

    //   const respons =  await budgetApi.getBudget(2)
    //   const respons =  await budgetApi.getSummary()

        // console.log(response.data)
        // console.log(respons.data)

        //  const data = {
        //     month: '2026-05-01',
        //     amount: 500000
        // }

        // const response = await budgetApi.addBudget(data)

        // console.log(response.data)
        

        //  const response = await budgetApi.deleteBudget(11)

        // console.log(response.data)

        const response = await budgetApi.getBudgets(5,2026)

    console.log('DATA BUDGETS :', response.data)

    } catch (error) {

        // console.log(error)
            console.log('ERROR :', error)


    }

})

</script>

<template>
    <h1>Test Budget API</h1>
</template>