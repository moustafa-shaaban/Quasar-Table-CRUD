<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { useCustomersStore } from '@/stores/customers';

const customersStore = useCustomersStore();

const dialog = ref(false)
const dialogDelete = ref(false)
const columns = ref([
    {
        name: 'name',
        required: true,
        label: 'Names',
        align: 'left',
        field: row => row.name,
        format: val => `${val}`,
        sortable: true,
    },
    { name: 'email', align: 'center', label: 'Email', align: 'left', field: 'email', sortable: true },
    { name: 'address', label: 'Address', field: 'address', align: 'left', sortable: true },
    { name: 'phone', label: 'Phone', field: 'phone', align: 'left', },
    { name: 'country', label: 'Country', field: 'country', align: 'left', sortable: true },
    { name: 'actions', label: 'Actions', align: 'left', }
])

const customers = ref([])

const editedIndex = ref(-1)
const editedItem = ref({
    name: '',
    email: '',
    address: '',
    phone: '',
    county: '',
});

const defaultItem = ref({
    name: '',
    email: '',
    address: '',
    phone: '',
    county: '',
});

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'New Customer' : 'Edit Customer'
});

function initialize() {
    customers.value = customersStore.customersData
};

function editItem(item) {
    editedIndex.value = customers.value.indexOf(item)
    editedItem.value = Object.assign({}, item)
    dialog.value = true
}

function deleteItem(item) {
    editedIndex.value = customers.value.indexOf(item)
    editedItem.value = Object.assign({}, item)
    dialogDelete.value = true
}

function deleteItemConfirm(item) {
    customers.value.splice(editedIndex.value, 1)
    closeDelete()
}

function close() {
    dialog.value = false
    nextTick(() => {
        editedIndex.value = Object.assign({}, defaultItem.value)
        editedIndex.value = -1
    })
}

function closeDelete() {
    dialogDelete.value = false
    nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem.value)
        editedIndex.value = -1
    })
}
function save() {
    if (editedIndex.value > -1) {
        Object.assign(customers.value[editedIndex.value], editedItem.value)
    } else {
        customers.value.push(editedItem.value)
    }
    close()
}

watch(dialog, val => {
    val || close()
})
watch(dialogDelete, val => {
    val || closeDelete()
})

function confirm(id) {
    const customerToDelete = customersStore.customersData.find((item) => item.id === id)
    Dialog.create({
        dark: true,
        title: 'Confirm',
        color: 'primary',
        message: `Are you sure you want to delete ${customerToDelete.name} ?`,
        cancel: true,
        persistent: true
    }).onOk(() => {
        try {
            customersStore.deleteCustomer(id);
            Notify.create({
                message: `Customer ${customerToDelete.name} Deleted Successfully`,
                type: "positive",
                actions: [
                    { icon: 'close', color: 'white', round: true, }
                ]
            })
        } catch (error) {
            Notify.create({
                message: error.message,
                type: "negative",
                actions: [
                    { icon: 'close', color: 'white', round: true, }
                ]
            })
        }
    })
};
initialize()
</script>
<template>
    <q-page>
        <q-table :columns="columns" :rows="customers">
            <template v-slot:top-left="props">
                <q-btn color="primary" label="Add Customer" @click="dialog = true" />
                <q-btn color="primary" icon-right="archive" label="Export to csv" no-caps @click="exportTable" />
                <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="props.toggleFullscreen" class="q-ml-md" />
            </template>

            <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name" v-slot="scope">
                            <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                        </q-popup-edit>
                    </q-td>
                    <q-td key="gender" :props="props">{{ props.row.gender }}</q-td>

                    <q-td key="email" :props="props">
                        {{ props.row.email }}
                        <q-popup-edit v-model="props.row.email" type="email" title="Update email" buttons v-slot="scope">
                            <q-input v-model="scope.value" dense autofocus />
                        </q-popup-edit>
                    </q-td>
                    <q-td key="address" :props="props">
                        {{ props.row.address }}
                        <q-popup-edit v-model="props.row.address" title="Update address" buttons persistent v-slot="scope">
                            <q-input v-model="scope.value" dense autofocus hint="Use buttons to close" />
                        </q-popup-edit>
                    </q-td>
                    <q-td key="phone" :props="props">
                        <div class="text-pre-wrap">{{ props.row.phone }}</div>
                        <q-popup-edit v-model="props.row.phone" v-slot="scope">
                            <q-input type="textarea" v-model="scope.value" dense autofocus />
                        </q-popup-edit>
                    </q-td>
                    <q-td key="country" :props="props">
                        {{ props.row.country }}
                        <q-popup-edit v-model="props.row.country" title="Update country" buttons persistent v-slot="scope">
                            <q-input v-model="scope.value" dense autofocus hint="Use buttons to close" />
                        </q-popup-edit>
                    </q-td>

                    <q-td key="actions" :props="props">
                        <q-btn round color="info" icon="edit" @click="editItem(props.row)" />
                        <q-btn round color="negative" icon="delete" @click="confirm(props.row.id)" />
                    </q-td>
                </q-tr>
            </template>
            <template v-slot:item="props">
                <q-card class="q-ma-xs">
                    <q-list dense>
                        <q-item :key="columns.name" v-if="columns.field !== 'action'" v-for="col in props.cols">
                            <q-item-section>
                                <q-item-label>{{ col.label }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label caption>{{ col.value }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <q-card-section>
                        <q-btn dense flat round color="blue" field="edit" icon="edit" @click="editItem(item)"></q-btn>
                        <q-btn round color="negative" icon="delete" @click="confirm(props.row.id)" />
                    </q-card-section>
                </q-card>
            </template>
        </q-table>

        <q-dialog v-model="dialog">
            <q-card flat bordered class="form-card">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{ formTitle }}</div>
                    <q-space />
                    <q-btn icon="close" flat round dense @click="updateCustomerForm = false" />
                </q-card-section>


                <q-card-section>
                    <q-form @submit="save" @reset="onReset" class="q-gutter-md">
                        <q-input filled v-model="editedItem.name" label="Customer Name *" hint="Customer Name" lazy-rules
                            :rules="[val => val && val.length > 0 || 'Please type something']" />

                        <q-input filled type="email" v-model="editedItem.email" label="Customer Email *"
                            hint="Customer Email" lazy-rules
                            :rules="[val => val && val.length > 0 || 'Please type something']" />

                        <q-input filled type="textarea" v-model="editedItem.address" label="Customer Address *"
                            hint="Customer Address" lazy-rules
                            :rules="[val => val && val.length > 0 || 'Please type something']" />
                        <q-input filled type="number" v-model="editedItem.phone" label="Customer Phone *"
                            hint="Customer Phone" lazy-rules
                            :rules="[val => val && val.length > 0 || 'Please type something']" />
                        <q-input filled v-model="editedItem.country" label="Customer Country *" hint="Customer Country"
                            lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
                        <div>
                            <q-btn label="Submit" type="submit" color="primary" />
                            <q-btn label="Cancel" color="negative" flat class="q-ml-sm" @click="close" />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>