<script setup>
import { ref } from 'vue';
import { exportFile, Notify, Dialog, uid } from 'quasar';

import { useCustomersStore } from '@/stores/customers';
import { reactive } from 'vue';

const customersStore = useCustomersStore();

const showModal = ref(false)
const isUpdating = ref(false)

const formData = reactive({
  name: '',
  email: '',
  address: '',
  phone: '',
  country: '',
});

const resetForm = () => {
  //   formData.id = null
  formData.name = ''
  formData.email = ''
  formData.address = ''
  formData.phone = ''
  formData.country = ''
}

const openAddModal = () => {
  isUpdating.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (customer) => {
  isUpdating.value = true
  Object.assign(formData, customer)
  showModal.value = true
}

const submitForm = () => {

  if (isUpdating.value) {

    customersStore.updateCustomer(formData);

    Notify.create({
      message: `Customer ${formData.name} Updated Successfully`,
      type: "positive",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })

  } else {

    customersStore.createCustomer({ id: uid(), ...formData });

    Notify.create({
      message: `Customer ${formData.name} Created Successfully`,
      type: "positive",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })

  }

  showModal.value = false;

  resetForm()
}

const confirmDelete = (customer) => {
  Dialog.create({
    title: 'Confirm',
    message: 'Are you sure you want to delete this customer?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    customersStore.deleteCustomer(customer.id)
    Notify.create({
      message: `Customer ${customer.name} Deleted Successfully`,
      type: "positive",
      actions: [
        { icon: 'close', color: 'white', round: true, }
      ]
    })
  })
}

const filter = ref('');

const columns = [
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
]

const rows = customersStore.customersData;


function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

function exportTable() {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))].concat(
    rows.map(row => columns.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[col.field === void 0 ? col.name : col.field],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'data-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}

const pagination = ref({
  // sortBy: 'desc',
  // descending: false,
  // page: 2,
  rowsPerPage: 10
  // rowsNumber: xx if getting data from a server
})

</script>

<template>
  <q-page>
    <div class="q-pa-md">
      <q-table v-model:pagination="pagination" square :rows="rows" :columns="columns" row-key="id" rows-per-page="10"
        flat bordered separator="cell" :grid="$q.screen.lt.md" :dense="$q.screen.lt.md" :filter="filter"
        no-data-label="No data found">

        <template v-slot:top-left="props">
          <q-btn color="primary" label="Create Customer" @click="openAddModal" />
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
              <q-btn round color="info" icon="edit" @click="openEditModal(props.row)" />
              <q-btn round color="negative" icon="delete" @click="confirmDelete(props.row)" />
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
              <q-btn dense flat round color="blue" field="edit" icon="edit" @click="update(props.row.id)"></q-btn>
              <q-btn round color="negative" icon="delete" @click="confirm(props.row.id)" />
            </q-card-section>
          </q-card>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="showModal" persistent>
      <q-card flat bordered class="form-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ isUpdating ? 'Update Customer' : 'Create Customer' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>


        <q-card-section>
          <q-form @submit="submitForm" @reset="resetForm" class="q-gutter-md">
            <q-input filled v-model="formData.name" label="Customer Name *" hint="Customer Name" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="email" v-model="formData.email" label="Customer Email *" hint="Customer Email"
              lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />

            <q-input filled type="textarea" v-model="formData.address" label="Customer Address *"
              hint="Customer Address" lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled type="number" v-model="formData.phone" label="Customer Phone *" hint="Customer Phone"
              lazy-rules :rules="[val => val && val.length > 0 || 'Please type something']" />
            <q-input filled v-model="formData.country" label="Customer Country *" hint="Customer Country" lazy-rules
              :rules="[val => val && val.length > 0 || 'Please type something']" />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<style lang="sass">
.form-card
  width: 100%
  max-width: 400px
</style>