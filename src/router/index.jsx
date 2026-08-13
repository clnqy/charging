import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'

// 懒加载页面组件
const StationSummary = lazy(() => import('../pages/DataAnalysis/StationSummary'))
const StationRevenue = lazy(() => import('../pages/DataAnalysis/StationRevenue'))
const StationBusOperation = lazy(() => import('../pages/DataAnalysis/StationBusOperation'))
const StationSocialOperation = lazy(() => import('../pages/DataAnalysis/StationSocialOperation'))
const StationBusRevenue = lazy(() => import('../pages/DataAnalysis/StationBusRevenue'))
const StationCost = lazy(() => import('../pages/DataAnalysis/StationCost'))
const StationSocialRevenue = lazy(() => import('../pages/DataAnalysis/StationSocialRevenue'))
const BusLineEnergy = lazy(() => import('../pages/DataAnalysis/BusLineEnergy'))
const HistoricalElectricityPrice = lazy(() => import('../pages/DataAnalysis/HistoricalElectricityPrice'))
const StationBase = lazy(() => import('../pages/BaseData/StationBase'))
const VehicleBase = lazy(() => import('../pages/BaseData/VehicleBase'))
const OrderData = lazy(() => import('../pages/BaseData/OrderData'))
const LargeCustomerRuleConfig = lazy(() => import('../pages/Settlement/LargeCustomerRuleConfig'))
const SystemIndex = lazy(() => import('../pages/System/Index'))
const UserIndex = lazy(() => import('../pages/User/Index'))
const MessageIndex = lazy(() => import('../pages/Message/Index'))

const AppRouter = () => {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>}>
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 默认重定向到站点经营汇总表 */}
        <Route index element={<Navigate to="/data-analysis/station-summary" replace />} />
        
        {/* 数据统计与分析 */}
        <Route path="data-analysis" element={<Navigate to="/data-analysis/station-summary" replace />} />
        <Route path="data-analysis/station-summary" element={<StationSummary />} />
        <Route path="data-analysis/station-revenue" element={<StationRevenue />} />
        <Route path="data-analysis/station-bus-operation" element={<StationBusOperation />} />
        <Route path="data-analysis/station-social-operation" element={<StationSocialOperation />} />
        <Route path="data-analysis/station-bus-revenue" element={<StationBusRevenue />} />
        <Route path="data-analysis/station-cost" element={<StationCost />} />
        <Route path="data-analysis/station-social-revenue" element={<StationSocialRevenue />} />
        <Route path="data-analysis/bus-line-energy" element={<BusLineEnergy />} />
        <Route path="data-analysis/historical-electricity-price" element={<HistoricalElectricityPrice />} />
        
        
        
        {/* 系统管理 */}
        <Route path="system" element={<SystemIndex />} />
        <Route path="system/role" element={<SystemIndex />} />
        <Route path="system/user" element={<SystemIndex />} />
        <Route path="system/log" element={<SystemIndex />} />
        
        {/* 用户管理 */}
        <Route path="user" element={<UserIndex />} />
        <Route path="user/list" element={<UserIndex />} />
        <Route path="user/group" element={<UserIndex />} />
        
        {/* 消息通知 */}
        <Route path="message" element={<MessageIndex />} />
        
        {/* 基础数据管理 */}
        <Route path="base-data/station" element={<StationBase />} />
        <Route path="base-data/vehicle" element={<VehicleBase />} />
        <Route path="base-data/order" element={<OrderData />} />

        <Route path="settlement" element={<Navigate to="/settlement/large-customer-rules" replace />} />
        <Route path="settlement/large-customer-rules" element={<LargeCustomerRuleConfig />} />
        
        {/* 404 重定向 */}
        <Route path="*" element={<Navigate to="/data-analysis" replace />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

export default AppRouter
