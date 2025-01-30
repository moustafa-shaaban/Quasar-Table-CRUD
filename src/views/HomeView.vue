<script setup>
import { ref, onMounted } from 'vue';
import { exportFile } from 'quasar';

import { customers } from '../data/data'

const customersData = ref();

customersData.value = customers

const rows = customersData;
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
  { name: 'gender', label: 'Gender', align: 'left', field: 'gender' },
  { name: 'email', align: 'center', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'address', label: 'Address', field: 'address', align: 'left', sortable: true },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'left', },
  { name: 'country', label: 'Country', field: 'country', align: 'left', sortable: true },
]



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
    'table-export.csv',
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
      <q-table v-model:pagination="pagination" square :rows="rows" :columns="columns" row-key="id" rows-per-page="10" flat
        bordered separator="cell" :grid="$q.screen.lt.md" :dense="$q.screen.lt.md" :filter="filter"
        no-data-label="No data found">

        <template v-slot:top-left="props">
          <q-btn color="primary" label="Add row" />
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
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>