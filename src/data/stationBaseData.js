import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'station-base-data'
const UPDATE_EVENT = 'station-base-data-updated'

const INITIAL_STATION_DATA = [
  {
    code: 'ST001',
    originalCode: 'CZ-001',
    name: '中心广场充电站',
    shortName: '中心广场',
    group: '市区站群',
    source: '系统同步',
    commissionTime: '2024-01-15',
    pileCount: 8,
    gunCount: 16,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '',
  },
  {
    code: 'ST002',
    originalCode: 'GX-002',
    name: '高新园区充电站',
    shortName: '高新园区',
    group: '高新站群',
    source: '外部导入',
    commissionTime: '2024-03-20',
    pileCount: 6,
    gunCount: 12,
    coopMode: '驿满慢充',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '北部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '慢充',
    businessStatus: '营业中',
    remark: '',
  },
  {
    code: 'ST003',
    originalCode: 'HC-003',
    name: '火车站充电站',
    shortName: '火车站',
    group: '交通站群',
    source: '系统同步',
    commissionTime: '2023-11-10',
    pileCount: 12,
    gunCount: 24,
    coopMode: '外协站',
    coopUnit: '第三方合作单位',
    managementUnit: '南部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    businessStatus: '暂停营业',
    remark: '交通枢纽重点站点',
  },
  {
    code: 'ST004',
    originalCode: 'TY-004',
    name: '体育馆充电站',
    shortName: '体育馆',
    group: '市区站群',
    source: '外部导入',
    commissionTime: '2024-05-08',
    pileCount: 4,
    gunCount: 8,
    coopMode: '场地合作站',
    coopUnit: '国网重庆电动汽车服务有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '国网平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '',
  },
  {
    code: 'ST005',
    originalCode: 'SY-005',
    name: '机场充电站',
    shortName: '机场',
    group: '交通站群',
    source: '系统同步',
    commissionTime: '2024-02-28',
    pileCount: 16,
    gunCount: 32,
    coopMode: '高压合作站',
    coopUnit: '高压合作方',
    managementUnit: '北部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '高压供电',
  },
  {
    code: 'ST006',
    originalCode: 'DX-006',
    name: '大学城充电站',
    shortName: '大学城',
    group: '教育站群',
    source: '外部导入',
    commissionTime: '2024-06-15',
    pileCount: 6,
    gunCount: 12,
    coopMode: '低压合作站',
    coopUnit: '低压合作方',
    managementUnit: '南部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    businessStatus: '停业',
    remark: '',
  },
  {
    code: 'ST007',
    originalCode: 'GY-007',
    name: '工业园充电站',
    shortName: '工业园',
    group: '工业站群',
    source: '系统同步',
    commissionTime: '2024-04-22',
    pileCount: 10,
    gunCount: 20,
    coopMode: '三方平台互通站',
    coopUnit: '第三方平台',
    managementUnit: '北部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '多平台互通',
  },
  {
    code: 'ST008',
    originalCode: 'WL-008',
    name: '物流中心充电站',
    shortName: '物流中心',
    group: '工业站群',
    source: '外部导入',
    commissionTime: '2024-07-10',
    pileCount: 8,
    gunCount: 16,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '南部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '',
  },
  {
    code: 'ST009',
    originalCode: 'JC-009',
    name: '医院充电站',
    shortName: '医院',
    group: '医疗站群',
    source: '系统同步',
    commissionTime: '2024-08-05',
    pileCount: 4,
    gunCount: 8,
    coopMode: '场地合作站',
    coopUnit: '国网重庆电动汽车服务有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '国网平台',
    fastSlow: '慢充',
    businessStatus: '暂停营业',
    remark: '公立医院',
  },
  {
    code: 'ST010',
    originalCode: 'SC-010',
    name: '商业中心充电站',
    shortName: '商业中心',
    group: '市区站群',
    source: '外部导入',
    commissionTime: '2024-09-18',
    pileCount: 12,
    gunCount: 24,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '北部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    businessStatus: '营业中',
    remark: '市中心核心商圈',
  },
]

const enrichStationData = (stations) => stations.map((station, index) => {
  const gunCount = station.gunCount || 0
  const equipmentPower = gunCount * (station.fastSlow === '慢充' ? 30 : 60)

  return {
    ...station,
    maxChargingCapacity: Math.max(1, Math.round(gunCount * (index % 3 === 0 ? 1.6 : 1.2))),
    businessHours: index % 4 === 0 ? '00:00-24:00' : '06:00-22:00',
    nightGunCount: Math.max(0, Math.floor(gunCount * (index % 3 === 0 ? 0.5 : 0.25))),
    equipmentPower,
  }
})

const readStoredStationData = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Fall back to the prototype source when storage is unavailable or invalid.
  }
  return enrichStationData(INITIAL_STATION_DATA)
}

const persistStationData = (nextData) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData))
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  } catch {
    // Keep the in-memory update when browser storage is unavailable.
  }
}

export const useStationBaseData = () => {
  const [stationData, setStationDataState] = useState(readStoredStationData)

  const setStationData = useCallback((nextValue) => {
    setStationDataState((previous) => {
      const nextData = typeof nextValue === 'function' ? nextValue(previous) : nextValue
      persistStationData(nextData)
      return nextData
    })
  }, [])

  useEffect(() => {
    const syncFromStorage = () => setStationDataState(readStoredStationData())
    window.addEventListener(UPDATE_EVENT, syncFromStorage)
    window.addEventListener('storage', syncFromStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [])

  return [stationData, setStationData]
}

export { INITIAL_STATION_DATA }
