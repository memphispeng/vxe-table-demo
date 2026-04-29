const { createApp, computed, reactive, ref, watch, nextTick } = Vue;

const departments = ["產品", "工程", "行銷", "客服", "財務", "人資", "業務", "法務"];
const cities = ["台北", "新北", "桃園", "台中", "台南", "高雄", "新竹", "基隆"];
const statuses = ["在職", "遠端", "休假", "培訓中"];
const levels = ["L1", "L2", "L3", "L4", "M1", "M2"];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-Hant");
}

function createFakeRows(total) {
  const startedAt = performance.now();
  const rows = new Array(total);

  for (let index = 0; index < total; index += 1) {
    const id = index + 1;
    const department = departments[index % departments.length];
    const city = cities[index % cities.length];
    const status = statuses[index % statuses.length];
    const level = levels[index % levels.length];
    const age = 22 + (index % 23);
    const salary = 36000 + (index % 220) * 430;
    const score = 60 + (index % 41);
    const joinMonth = String((index % 12) + 1).padStart(2, "0");
    const joinDay = String((index % 28) + 1).padStart(2, "0");
    const joinDate = `202${index % 6}-${joinMonth}-${joinDay}`;
    const employeeNo = `EMP-${String(id).padStart(6, "0")}`;
    const name = `員工 ${String(id).padStart(6, "0")}`;
    const email = `user${id}@demo.local`;

    rows[index] = {
      id,
      employeeNo,
      name,
      department,
      city,
      age,
      level,
      status,
      joinDate,
      email,
      salary,
      score,
      _search: `${employeeNo} ${name} ${department} ${city} ${status} ${level} ${email}`.toLowerCase()
    };
  }

  return {
    rows,
    duration: Math.round(performance.now() - startedAt)
  };
}

createApp({
  setup() {
    const totalRows = 100000;
    const searchText = ref("");
    const keyword = ref("");
    const tableData = ref([]);
    const generationMs = ref(0);
    const isGenerating = ref(false);

    const filters = reactive({
      department: "全部",
      status: "全部",
      city: "全部",
      level: "全部",
      minSalary: "",
      maxSalary: ""
    });

    const columns = [
      { field: "id", title: "ID", width: 90, sortable: true },
      { field: "employeeNo", title: "工號", width: 140, sortable: true },
      { field: "name", title: "姓名", minWidth: 160, sortable: true },
      { field: "department", title: "部門", width: 110, sortable: true },
      { field: "city", title: "城市", width: 110, sortable: true },
      { field: "age", title: "年齡", width: 90, sortable: true },
      { field: "level", title: "職級", width: 90, sortable: true },
      { field: "status", title: "狀態", width: 110, sortable: true },
      { field: "joinDate", title: "到職日", width: 130, sortable: true },
      { field: "email", title: "Email", minWidth: 220 },
      {
        field: "salary",
        title: "月薪",
        width: 140,
        sortable: true,
        formatter: ({ cellValue }) => `NT$ ${formatNumber(cellValue)}`
      },
      {
        field: "score",
        title: "績效",
        width: 100,
        sortable: true,
        formatter: ({ cellValue }) => `${cellValue} 分`
      }
    ];

    async function regenerateData() {
      isGenerating.value = true;
      await nextTick();
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const result = createFakeRows(totalRows);
      tableData.value = result.rows;
      generationMs.value = result.duration;
      isGenerating.value = false;
    }

    function resetFilters() {
      searchText.value = "";
      keyword.value = "";
      filters.department = "全部";
      filters.status = "全部";
      filters.city = "全部";
      filters.level = "全部";
      filters.minSalary = "";
      filters.maxSalary = "";
    }

    let filterTimer = null;
    watch(searchText, (value) => {
      window.clearTimeout(filterTimer);
      filterTimer = window.setTimeout(() => {
        keyword.value = value.trim().toLowerCase();
      }, 200);
    });

    const filteredData = computed(() => {
      const minSalary = filters.minSalary === "" ? null : Number(filters.minSalary);
      const maxSalary = filters.maxSalary === "" ? null : Number(filters.maxSalary);

      return tableData.value.filter((row) => {
        if (keyword.value && !row._search.includes(keyword.value)) {
          return false;
        }
        if (filters.department !== "全部" && row.department !== filters.department) {
          return false;
        }
        if (filters.status !== "全部" && row.status !== filters.status) {
          return false;
        }
        if (filters.city !== "全部" && row.city !== filters.city) {
          return false;
        }
        if (filters.level !== "全部" && row.level !== filters.level) {
          return false;
        }
        if (minSalary !== null && row.salary < minSalary) {
          return false;
        }
        if (maxSalary !== null && row.salary > maxSalary) {
          return false;
        }
        return true;
      });
    });

    regenerateData();

    return {
      columns,
      departments,
      cities,
      statuses,
      levels,
      filters,
      filteredData,
      formatNumber,
      generationMs,
      isGenerating,
      regenerateData,
      resetFilters,
      searchText,
      tableData
    };
  }
})
  .use(VxeUI)
  .use(VXETable)
  .mount("#app");
