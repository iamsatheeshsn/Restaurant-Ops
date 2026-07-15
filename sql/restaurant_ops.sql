-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 13, 2026 at 11:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurant_ops`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylog`
--

CREATE TABLE `activitylog` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activitylog`
--

INSERT INTO `activitylog` (`id`, `tenantId`, `userId`, `action`, `details`, `ipAddress`, `createdAt`) VALUES
('0beccb9f-f907-4e94-9f96-93c4427d98e6', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '7a0cf963-1389-4fa2-85de-7c610241d216', 'SEED_OPS', 'Operational demo data seeded (orders, CRM, expenses)', NULL, '2026-07-13 06:46:20.802'),
('3bdaf627-ad2b-4e41-a6a6-009bba2fda2a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', 'ORDER_COMPLETED', 'Completed sample order cdae1da7-786a-4e68-b1e2-06275a45903a', NULL, '2026-07-13 06:46:21.166'),
('739c56fa-5db5-40a2-910b-100a585bbfc7', '1986a50c-b166-4771-87df-3d37f61d66a2', '9cf93837-9c90-42bc-9cef-a40977391f92', 'SEED_OPS', 'Operational demo data seeded (orders, CRM, expenses)', NULL, '2026-07-13 06:46:21.005'),
('ac63ca49-010b-41b4-815b-18b4077a01da', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '8d4313ef-208d-42db-b106-b20cfa240eee', 'SEED_OPS', 'Operational demo data seeded (orders, CRM, expenses)', NULL, '2026-07-13 06:46:21.166'),
('b4a765f2-2d03-4a01-ba54-827ae0f11515', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '34ee8023-99c7-4ce1-8988-249586b65450', 'ORDER_COMPLETED', 'Completed sample order be56c5cf-c227-4f0f-9f7c-939c4384e750', NULL, '2026-07-13 06:46:21.690'),
('d310705e-3cf3-4a51-a957-37610bf71eea', '1986a50c-b166-4771-87df-3d37f61d66a2', '503b4d6d-c89f-4d5e-a792-c855374b17fb', 'ORDER_COMPLETED', 'Completed sample order bd667c7f-8c1f-4dec-9a34-c45fd61e5456', NULL, '2026-07-13 06:46:21.005'),
('d36d2aab-d81b-400c-950a-b33468d3b63e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'b317467b-28b9-4fd6-8f37-ae168492aba4', 'ORDER_COMPLETED', 'Completed sample order 9549c8d6-69bd-4193-9469-a72e68ae1d20', NULL, '2026-07-13 06:46:20.802'),
('ff29f350-86fa-4e77-9b18-143dc00a545d', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', 'SEED_OPS', 'Operational demo data seeded (orders, CRM, expenses)', NULL, '2026-07-13 06:46:21.690');

-- --------------------------------------------------------

--
-- Table structure for table `apikeyrecord`
--

CREATE TABLE `apikeyrecord` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `keyPrefix` varchar(20) NOT NULL,
  `keyHash` varchar(255) NOT NULL,
  `tenantId` varchar(36) DEFAULT NULL,
  `createdBy` varchar(36) DEFAULT NULL,
  `revokedAt` datetime(3) DEFAULT NULL,
  `lastUsedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `apikeyrecord`
--

INSERT INTO `apikeyrecord` (`id`, `name`, `keyPrefix`, `keyHash`, `tenantId`, `createdBy`, `revokedAt`, `lastUsedAt`, `createdAt`) VALUES
('b253eb94-87f5-4480-b81c-49e1ff783a63', 'Platform read-only demo key', 'pk_demo_', '$2a$10$platformDemoKeyHashPlaceholder000000000000000000000u', NULL, 'seed', NULL, NULL, '2026-07-13 05:17:47.429');

-- --------------------------------------------------------

--
-- Table structure for table `approvalrequest`
--

CREATE TABLE `approvalrequest` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `type` enum('PO','EXPENSE','WASTE','INVENTORY','TRANSFER') NOT NULL,
  `refId` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `requestedById` varchar(36) NOT NULL,
  `decidedById` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `approvalrequest`
--

INSERT INTO `approvalrequest` (`id`, `tenantId`, `type`, `refId`, `title`, `status`, `requestedById`, `decidedById`, `notes`, `createdAt`) VALUES
('03658bdc-ffcc-4ee3-b4ad-4aa737d02b0d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'INVENTORY', 'seed-inventory', 'Approve stock adjustment — coffee beans', 'PENDING', '8d4313ef-208d-42db-b106-b20cfa240eee', NULL, NULL, '2026-07-13 06:46:21.150'),
('070eabca-0b78-4bff-8147-db58ad81611d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'INVENTORY', 'seed-inventory', 'Approve stock adjustment — coffee beans', 'PENDING', '7a0cf963-1389-4fa2-85de-7c610241d216', NULL, NULL, '2026-07-13 06:46:20.774'),
('7a405273-378e-475e-bb07-99960f03a457', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'INVENTORY', 'seed-inventory', 'Approve stock adjustment — coffee beans', 'PENDING', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', NULL, NULL, '2026-07-13 06:46:21.677'),
('86be6972-52db-4c3a-aea4-eb18a9502d7c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'EXPENSE', 'seed-expense', 'Approve packaging supplies expense', 'PENDING', '3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', NULL, NULL, '2026-07-13 06:46:21.150'),
('90b0c0d7-19e6-4172-88c3-474c6126a606', '1986a50c-b166-4771-87df-3d37f61d66a2', 'EXPENSE', 'seed-expense', 'Approve packaging supplies expense', 'PENDING', '503b4d6d-c89f-4d5e-a792-c855374b17fb', NULL, NULL, '2026-07-13 06:46:20.988'),
('c7fa08f0-6cbc-43e3-a8b4-a8fbb30080b2', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'EXPENSE', 'seed-expense', 'Approve packaging supplies expense', 'PENDING', '34ee8023-99c7-4ce1-8988-249586b65450', NULL, NULL, '2026-07-13 06:46:21.677'),
('d58f509b-08d6-4559-a2d0-1df6e1c24bfb', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'EXPENSE', 'seed-expense', 'Approve packaging supplies expense', 'PENDING', 'b317467b-28b9-4fd6-8f37-ae168492aba4', NULL, NULL, '2026-07-13 06:46:20.774'),
('da5e9a29-f14a-491b-a578-b4c7329c468d', '1986a50c-b166-4771-87df-3d37f61d66a2', 'INVENTORY', 'seed-inventory', 'Approve stock adjustment — coffee beans', 'PENDING', '9cf93837-9c90-42bc-9cef-a40977391f92', NULL, NULL, '2026-07-13 06:46:20.988');

-- --------------------------------------------------------

--
-- Table structure for table `backuppolicy`
--

CREATE TABLE `backuppolicy` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `frequency` varchar(50) NOT NULL,
  `retentionDays` int(11) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastRunAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `backuppolicy`
--

INSERT INTO `backuppolicy` (`id`, `name`, `frequency`, `retentionDays`, `isActive`, `lastRunAt`) VALUES
('136b3a43-c06c-4b7f-838c-2337926cdc75', 'Nightly full backup', 'DAILY', 30, 1, '2026-07-12 23:17:47.379'),
('5a3422bd-6037-45b9-8c3c-650e42db067e', 'Weekly archive', 'WEEKLY', 90, 1, '2026-07-11 05:17:47.379');

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `country` varchar(50) NOT NULL DEFAULT 'US',
  `isCentralKitchen` tinyint(1) NOT NULL DEFAULT 0,
  `isWarehouse` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`id`, `tenantId`, `name`, `address`, `phone`, `email`, `currency`, `country`, `isCentralKitchen`, `isWarehouse`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Tastyc Coffee House - Manhattan', '120 Broadway, New York, NY 10271', '+12125550199', 'manhattan@tastyc.com', 'USD', 'US', 0, 0, '2026-07-10 11:21:29.670', '2026-07-10 11:21:29.670', NULL),
('2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Ocean Bistro - Santa Monica', '1440 Ocean Ave, Santa Monica, CA 90401', '+13105550110', 'santamonica@oceanbistro.com', 'USD', 'US', 0, 0, '2026-07-13 05:23:33.249', '2026-07-13 05:23:33.249', NULL),
('6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Spice Haven - Indiranagar', '12th Main, Indiranagar, Bengaluru 560038', '+918012345001', 'indiranagar@spicehaven.com', 'USD', 'US', 0, 0, '2026-07-13 05:23:32.934', '2026-07-13 05:23:32.934', NULL),
('d5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Green Leaf - Shoreditch', '88 Brick Lane, London E1 6RL', '+442079460123', 'shoreditch@greenleafcafe.co.uk', 'USD', 'US', 0, 0, '2026-07-13 05:23:33.734', '2026-07-13 05:23:33.734', NULL),
('d8e5ce7e-e653-4b4c-94dd-2381a1edda17', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Spice Haven - Koramangala', '80 Feet Road, Koramangala, Bengaluru 560034', '+918012345002', 'koramangala@spicehaven.com', 'USD', 'US', 0, 0, '2026-07-13 05:23:32.987', '2026-07-13 05:23:32.987', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `coupon`
--

CREATE TABLE `coupon` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discountType` varchar(20) NOT NULL DEFAULT 'PERCENTAGE',
  `value` decimal(10,2) NOT NULL,
  `minOrderAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expiryDate` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon`
--

INSERT INTO `coupon` (`id`, `tenantId`, `code`, `discountType`, `value`, `minOrderAmount`, `expiryDate`, `isActive`, `createdAt`) VALUES
('2f20b3ca-09fc-4145-a3c3-18ee9f06a368', '1986a50c-b166-4771-87df-3d37f61d66a2', 'SAVE10-1986', 'PERCENTAGE', 10.00, 25.00, '2026-09-11 06:46:20.917', 1, '2026-07-13 06:46:20.924'),
('4d0fd146-86dc-4c38-ac9f-16802440747a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'SAVE10-A6E6', 'PERCENTAGE', 10.00, 25.00, '2026-09-11 06:46:20.660', 1, '2026-07-13 06:46:20.666'),
('6459ecd6-248f-478e-8642-bff9a39bc20c', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'SAVE10-60CF', 'PERCENTAGE', 10.00, 25.00, '2026-09-11 06:46:21.523', 1, '2026-07-13 06:46:21.529'),
('eabe4f6f-4608-477e-a4ef-e5358d2b9a5f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'SAVE10-73AB', 'PERCENTAGE', 10.00, 25.00, '2026-09-11 06:46:21.089', 1, '2026-07-13 06:46:21.096');

-- --------------------------------------------------------

--
-- Table structure for table `customerprofile`
--

CREATE TABLE `customerprofile` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `pointsBalance` int(11) NOT NULL DEFAULT 0,
  `membershipTier` varchar(50) NOT NULL DEFAULT 'SILVER',
  `walletBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `birthday` datetime(3) DEFAULT NULL,
  `favoriteFood` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customerprofile`
--

INSERT INTO `customerprofile` (`id`, `userId`, `pointsBalance`, `membershipTier`, `walletBalance`, `birthday`, `favoriteFood`, `createdAt`, `updatedAt`) VALUES
('91253e34-ff49-4661-8c47-456861f3ba07', 'e2156806-3da9-4151-af64-4648f7ba1c37', 150, 'SILVER', 10.00, NULL, NULL, '2026-07-13 07:20:02.802', '2026-07-13 07:20:02.802');

-- --------------------------------------------------------

--
-- Table structure for table `deliveryjob`
--

CREATE TABLE `deliveryjob` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `orderId` varchar(36) DEFAULT NULL,
  `branchId` varchar(36) DEFAULT NULL,
  `assigneeId` varchar(36) DEFAULT NULL,
  `status` enum('ASSIGNED','EN_ROUTE','DELIVERED','FAILED') NOT NULL DEFAULT 'ASSIGNED',
  `address` text NOT NULL,
  `proofUrl` text DEFAULT NULL,
  `codAmount` decimal(12,2) DEFAULT NULL,
  `customerName` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deliveryjob`
--

INSERT INTO `deliveryjob` (`id`, `tenantId`, `orderId`, `branchId`, `assigneeId`, `status`, `address`, `proofUrl`, `codAmount`, `customerName`, `createdAt`, `updatedAt`) VALUES
('0d085e84-5f91-4680-8523-2624103b077b', '1986a50c-b166-4771-87df-3d37f61d66a2', '6725959a-fe70-4d67-b81d-6c12f1376230', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '9cf93837-9c90-42bc-9cef-a40977391f92', 'EN_ROUTE', '120 Demo Street, Local District', NULL, 1386.00, 'Alex Rivera', '2026-07-13 06:46:20.898', '2026-07-13 06:46:20.898'),
('0f88a0f8-6517-4801-ad45-43ce8b05684b', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'fc1406d9-b263-430a-b84d-d17a19d3994c', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '8d4313ef-208d-42db-b106-b20cfa240eee', 'EN_ROUTE', '120 Demo Street, Local District', NULL, 94.50, 'Alex Rivera', '2026-07-13 06:46:21.076', '2026-07-13 06:46:21.076'),
('554729bd-651b-48e6-bb05-5403dc677316', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'f2c429a9-c354-4945-adb4-e1872e75fc6c', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '348a2366-b1bd-4651-bbfa-b0ff6a25db80', 'ASSIGNED', '121 Demo Street, Local District', NULL, 32.29, 'Jordan Lee', '2026-07-13 06:46:20.647', '2026-07-13 06:46:20.647'),
('5a84de45-92a1-4fda-9bda-1d4c7adc2c59', '1986a50c-b166-4771-87df-3d37f61d66a2', '7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '9cf93837-9c90-42bc-9cef-a40977391f92', 'ASSIGNED', '121 Demo Street, Local District', NULL, 1554.00, 'Jordan Lee', '2026-07-13 06:46:20.902', '2026-07-13 06:46:20.902'),
('5c94d774-04de-4745-89af-dba70ee6c292', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '67231acb-f1a2-4997-ab96-ef43abc1640b', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', 'EN_ROUTE', '120 Demo Street, Local District', NULL, 42.00, 'Alex Rivera', '2026-07-13 06:46:21.506', '2026-07-13 06:46:21.506'),
('9029cf9a-2dae-4307-8ca1-5d5d219e2c21', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'cc499edb-fd28-4bb1-8ec3-04717abb5828', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '348a2366-b1bd-4651-bbfa-b0ff6a25db80', 'EN_ROUTE', '120 Demo Street, Local District', NULL, 14.44, 'Alex Rivera', '2026-07-13 06:46:20.641', '2026-07-13 06:46:20.641'),
('a60556ef-cdb3-42c5-8cf2-ac5f64a4fb60', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'ec7c9816-1501-49f1-9cee-4d4728dc9322', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', 'ASSIGNED', '121 Demo Street, Local District', NULL, 50.82, 'Jordan Lee', '2026-07-13 06:46:21.511', '2026-07-13 06:46:21.511'),
('e37a98c9-3fcb-4a65-bf36-ba80f77c5922', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'd2373e00-d7d0-43b1-98fd-dc49c69e8ebb', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '8d4313ef-208d-42db-b106-b20cfa240eee', 'ASSIGNED', '121 Demo Street, Local District', NULL, 144.90, 'Jordan Lee', '2026-07-13 06:46:21.081', '2026-07-13 06:46:21.081');

-- --------------------------------------------------------

--
-- Table structure for table `eventbooking`
--

CREATE TABLE `eventbooking` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `title` varchar(150) NOT NULL,
  `customerName` varchar(150) NOT NULL,
  `customerPhone` varchar(50) NOT NULL,
  `guestCount` int(11) NOT NULL DEFAULT 10,
  `eventDate` datetime(3) NOT NULL,
  `cateringDetails` text DEFAULT NULL,
  `totalCost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `eventbooking`
--

INSERT INTO `eventbooking` (`id`, `tenantId`, `branchId`, `title`, `customerName`, `customerPhone`, `guestCount`, `eventDate`, `cateringDetails`, `totalCost`, `status`, `createdAt`) VALUES
('6567a3d4-fe20-4d92-8433-7da39755db5d', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Corporate Lunch Buffet', 'Northwind Corp', '+15550999', 40, '2026-07-23 06:46:20.988', 'Vegetarian + non-veg trays, soft drinks', 1250.00, 'CONFIRMED', '2026-07-13 06:46:20.995'),
('73cb171d-ae0b-4b29-a7e8-328fc3b9c05a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'Corporate Lunch Buffet', 'Northwind Corp', '+15550999', 40, '2026-07-23 06:46:20.775', 'Vegetarian + non-veg trays, soft drinks', 1250.00, 'CONFIRMED', '2026-07-13 06:46:20.782'),
('7f172141-10a3-44be-bc69-61d7a641a158', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Corporate Lunch Buffet', 'Northwind Corp', '+15550999', 40, '2026-07-23 06:46:21.146', 'Vegetarian + non-veg trays, soft drinks', 1250.00, 'CONFIRMED', '2026-07-13 06:46:21.153'),
('b9258ab3-239f-4adb-ba0a-0397a51bdb10', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'Corporate Lunch Buffet', 'Northwind Corp', '+15550999', 40, '2026-07-23 06:46:21.673', 'Vegetarian + non-veg trays, soft drinks', 1250.00, 'CONFIRMED', '2026-07-13 06:46:21.680');

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdById` varchar(36) NOT NULL,
  `approvedById` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`id`, `tenantId`, `branchId`, `amount`, `category`, `description`, `status`, `createdById`, `approvedById`, `createdAt`) VALUES
('06ebb47f-7917-4045-8833-7e0304c3a48b', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 320.00, 'Maintenance', 'Espresso machine service', 'PENDING', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', NULL, '2026-07-13 06:46:21.613'),
('07e15287-a398-4b47-a0c5-fb2ba0ef92fb', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 245.50, 'Utilities', 'Monthly kitchen utilities', 'APPROVED', '9cf93837-9c90-42bc-9cef-a40977391f92', '9cf93837-9c90-42bc-9cef-a40977391f92', '2026-07-13 06:46:20.934'),
('0db39c15-c57b-4425-9d6a-7cfffa0ef65c', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 15000.00, 'Utilities', 'Monthly utilities — demo seed', 'APPROVED', '9cf93837-9c90-42bc-9cef-a40977391f92', '9cf93837-9c90-42bc-9cef-a40977391f92', '2026-07-13 05:23:33.098'),
('2256ee9b-c99c-4696-8504-4b41d7616768', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 850.00, 'Utilities', 'Monthly utilities — demo seed', 'APPROVED', '8d4313ef-208d-42db-b106-b20cfa240eee', '8d4313ef-208d-42db-b106-b20cfa240eee', '2026-07-13 05:23:33.350'),
('28e1d085-25c0-4e14-a5ef-c3dc9237fb3f', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 89.00, 'Supplies', 'To-go packaging restock', 'PENDING', '503b4d6d-c89f-4d5e-a792-c855374b17fb', NULL, '2026-07-13 06:46:20.934'),
('48133e4d-f88c-4dfe-b261-f2fef7a52465', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 245.50, 'Utilities', 'Monthly kitchen utilities', 'APPROVED', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '2026-07-13 06:46:21.613'),
('5b4d0e06-0593-4b16-ad22-ff955bdc1b9f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 245.50, 'Utilities', 'Monthly kitchen utilities', 'APPROVED', '8d4313ef-208d-42db-b106-b20cfa240eee', '8d4313ef-208d-42db-b106-b20cfa240eee', '2026-07-13 06:46:21.103'),
('7092a9ff-660e-4509-adf5-20bfea460433', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 320.00, 'Maintenance', 'Espresso machine service', 'PENDING', '7a0cf963-1389-4fa2-85de-7c610241d216', NULL, '2026-07-13 06:46:20.683'),
('75a74c25-1799-4acb-a2f3-a381cfef4ae7', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 89.00, 'Supplies', 'To-go packaging restock', 'PENDING', 'b317467b-28b9-4fd6-8f37-ae168492aba4', NULL, '2026-07-13 06:46:20.683'),
('af65b734-82b6-4bbd-b68f-1ff3dc126356', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 89.00, 'Supplies', 'To-go packaging restock', 'PENDING', '34ee8023-99c7-4ce1-8988-249586b65450', NULL, '2026-07-13 06:46:21.613'),
('d1563709-279c-4a57-a60b-11c58b3d29e3', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 245.50, 'Utilities', 'Monthly kitchen utilities', 'APPROVED', '7a0cf963-1389-4fa2-85de-7c610241d216', '7a0cf963-1389-4fa2-85de-7c610241d216', '2026-07-13 06:46:20.683'),
('d4b73b83-f538-4c0b-82ed-6a764c7142ab', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 320.00, 'Maintenance', 'Espresso machine service', 'PENDING', '9cf93837-9c90-42bc-9cef-a40977391f92', NULL, '2026-07-13 06:46:20.934'),
('d6f1cb2f-4e0b-4ed2-8186-f4751ec3c468', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 420.00, 'Utilities', 'Monthly utilities — demo seed', 'APPROVED', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '2026-07-13 05:23:33.887'),
('d9651cd3-6de6-4f3a-8bc4-1b962dbfe27d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 89.00, 'Supplies', 'To-go packaging restock', 'PENDING', '3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', NULL, '2026-07-13 06:46:21.103'),
('ed103567-2974-48f8-bd71-4bfa87bb5da6', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 320.00, 'Maintenance', 'Espresso machine service', 'PENDING', '8d4313ef-208d-42db-b106-b20cfa240eee', NULL, '2026-07-13 06:46:21.103');

-- --------------------------------------------------------

--
-- Table structure for table `floor`
--

CREATE TABLE `floor` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `floor`
--

INSERT INTO `floor` (`id`, `tenantId`, `branchId`, `name`) VALUES
('1645e00a-5372-4adb-9ab8-6084bd1771e0', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'Main Hall'),
('1e8af85e-66ab-4809-9e07-40a97ed585c7', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'Mezzanine'),
('21662aaa-6b17-450c-ab1c-378ea83cd822', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'Ground Floor'),
('468745b0-4ae8-4f7a-bb70-e88caea2713d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Bar Lounge'),
('4f631118-630b-495f-b175-2b36c36d78e8', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Private Dining'),
('72f88fbb-d2cf-4fea-8681-ab679904883b', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Ocean View'),
('785b26c1-f4b6-42c3-b184-4ddaaba15bef', '1986a50c-b166-4771-87df-3d37f61d66a2', 'd8e5ce7e-e653-4b4c-94dd-2381a1edda17', 'Main Floor'),
('8a995be8-9ea6-4b5b-9e56-2c7cb9574327', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Dining Hall'),
('dd95d109-b3e2-4a21-98ee-21585c8ff8b0', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'Outdoor Patio');

-- --------------------------------------------------------

--
-- Table structure for table `giftcard`
--

CREATE TABLE `giftcard` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `code` varchar(50) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `expiryDate` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `giftcard`
--

INSERT INTO `giftcard` (`id`, `tenantId`, `code`, `balance`, `expiryDate`, `isActive`, `createdAt`) VALUES
('3ab28d30-d715-4113-84a2-dd9c36176fe1', '1986a50c-b166-4771-87df-3d37f61d66a2', 'GIFT-1986A5', 50.00, '2027-01-09 06:46:20.925', 1, '2026-07-13 06:46:20.931'),
('54cf18ac-99ce-45ea-b3c3-2c3bf59c6286', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'GIFT-73ABEE', 50.00, '2027-01-09 06:46:21.094', 1, '2026-07-13 06:46:21.100'),
('7e7f101d-6034-4afd-9f80-e112b267bc3c', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'GIFT-60CFBB', 50.00, '2027-01-09 06:46:21.536', 1, '2026-07-13 06:46:21.542'),
('984131c5-8dc6-40be-a29a-ac3b8bc7b0e8', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'GIFT-A6E6F3', 50.00, '2027-01-09 06:46:20.672', 1, '2026-07-13 06:46:20.678');

-- --------------------------------------------------------

--
-- Table structure for table `globaltaxsetting`
--

CREATE TABLE `globaltaxsetting` (
  `id` varchar(36) NOT NULL,
  `country` varchar(100) NOT NULL,
  `taxName` varchar(100) NOT NULL,
  `rate` decimal(8,4) NOT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `globaltaxsetting`
--

INSERT INTO `globaltaxsetting` (`id`, `country`, `taxName`, `rate`, `isDefault`) VALUES
('3eff7d55-fa0a-4fec-9674-e9d7f44255ca', 'India', 'GST', 18.0000, 0),
('5e93cd88-0b14-4b0c-afb6-57c665100f41', 'United Kingdom', 'VAT', 20.0000, 0),
('85024988-bbe4-447a-a88f-adcae751fcf4', 'UAE', 'VAT', 5.0000, 0),
('8902cd82-0bdf-4316-bba7-93df0059f3a7', 'United States', 'Sales Tax', 8.8750, 1);

-- --------------------------------------------------------

--
-- Table structure for table `ingredient`
--

CREATE TABLE `ingredient` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `unit` enum('KG','GRAM','LITER','ML','PCS','BOX') NOT NULL,
  `stockLevel` decimal(12,3) NOT NULL DEFAULT 0.000,
  `lowStockThreshold` decimal(12,3) NOT NULL DEFAULT 1.000,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ingredient`
--

INSERT INTO `ingredient` (`id`, `tenantId`, `name`, `unit`, `stockLevel`, `lowStockThreshold`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Coffee Beans (Arabica)', 'KG', 50.000, 10.000, '2026-07-10 11:21:30.203', '2026-07-10 11:21:30.203', NULL),
('0b62770a-eb8c-44e8-8006-3fea73952c89', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Acai Puree', 'KG', 6.000, 2.000, '2026-07-13 05:23:33.878', '2026-07-13 05:23:33.878', NULL),
('0d3fd69a-7333-4711-9f36-3f670666df17', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Chocolate Fudge Chips', 'KG', 8.000, 2.000, '2026-07-10 11:21:30.230', '2026-07-10 11:21:30.230', NULL),
('15fc92b3-5361-4f79-82e5-5ef3fc4290a5', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Whole Milk', 'LITER', 45.000, 15.000, '2026-07-10 11:21:30.215', '2026-07-10 11:21:30.215', NULL),
('19765635-fddb-4e5b-861e-cc42480a2769', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Quinoa', 'KG', 18.000, 4.000, '2026-07-13 05:23:33.863', '2026-07-13 05:23:33.863', NULL),
('23809928-84cc-454e-a5f0-bdf23ef3f900', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Caramel Syrup', 'LITER', 12.000, 4.000, '2026-07-10 11:21:30.223', '2026-07-10 11:21:30.223', NULL),
('2cf29a43-a662-4133-a240-dbebada070e8', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Paneer', 'KG', 25.000, 5.000, '2026-07-13 05:23:33.073', '2026-07-13 05:23:33.073', NULL),
('406e51d5-0c4f-4991-9e5c-26060044f019', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Brioche Buns', 'PCS', 120.000, 30.000, '2026-07-13 05:23:33.343', '2026-07-13 05:23:33.343', NULL),
('4dcd1cc3-596e-4446-b44c-4fabbf2e0bf8', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Pacific Oysters', 'KG', 20.000, 5.000, '2026-07-13 05:23:33.336', '2026-07-13 05:23:33.336', NULL),
('57e5e805-d57a-4754-afc0-d461595d8c4c', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Basmati Rice', 'KG', 80.000, 15.000, '2026-07-13 05:23:33.069', '2026-07-13 05:23:33.069', NULL),
('72651bfa-4f7e-402e-a8fd-ae36aff57984', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Ghee', 'LITER', 12.000, 3.000, '2026-07-13 05:23:33.083', '2026-07-13 05:23:33.083', NULL),
('7a93da86-9e78-4231-8b93-153389aa2fec', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Kale', 'KG', 10.000, 3.000, '2026-07-13 05:23:33.867', '2026-07-13 05:23:33.867', NULL),
('89b9f9c3-0d83-4349-bf87-bcdd5c428047', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Atlantic Salmon', 'KG', 30.000, 8.000, '2026-07-13 05:23:33.327', '2026-07-13 05:23:33.327', NULL),
('ccabdb55-45e0-4e59-b4ef-c26d83c8a86d', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Oat Milk', 'LITER', 40.000, 10.000, '2026-07-13 05:23:33.871', '2026-07-13 05:23:33.871', NULL),
('ec869a3d-acc8-4544-b311-2fb32c4836a5', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Chicken (boneless)', 'KG', 40.000, 10.000, '2026-07-13 05:23:33.080', '2026-07-13 05:23:33.080', NULL),
('fc9d794e-6428-4206-bb94-69f2b379fc55', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Lemon Butter', 'LITER', 8.000, 2.000, '2026-07-13 05:23:33.338', '2026-07-13 05:23:33.338', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `status` varchar(50) NOT NULL,
  `dueDate` datetime(3) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`id`, `tenantId`, `amount`, `currency`, `status`, `dueDate`, `paidAt`, `description`, `createdAt`) VALUES
('330ec309-48f4-4566-926c-311fd409756b', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 129.00, 'USD', 'OPEN', '2026-07-23 05:17:47.393', NULL, 'Growth plan — current billing period', '2026-07-13 05:17:47.404'),
('341aea35-7846-4382-b0fc-1b60efccfdb4', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 349.00, 'USD', 'OPEN', '2026-08-13 05:23:33.128', NULL, 'ENTERPRISE plan — Ocean Bistro', '2026-07-13 05:23:33.355'),
('acc6a48c-3509-460a-86bc-5204c6cc7cbd', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 129.00, 'USD', 'PAID', '2026-06-23 05:17:47.393', '2026-06-25 05:17:47.393', 'Growth plan — previous billing period', '2026-07-13 05:17:47.404'),
('e7e9057a-36b4-4738-99c7-a50bf0004159', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 49.00, 'USD', 'DRAFT', '2026-08-13 05:23:33.369', NULL, 'STARTER plan — Green Leaf Cafe', '2026-07-13 05:23:33.898'),
('fe0936df-f45d-4ad1-8533-9b82d9d12bc6', '1986a50c-b166-4771-87df-3d37f61d66a2', 129.00, 'USD', 'OPEN', '2026-08-13 05:23:32.492', NULL, 'GROWTH plan — Spice Haven Kitchen', '2026-07-13 05:23:33.113');

-- --------------------------------------------------------

--
-- Table structure for table `kitchensection`
--

CREATE TABLE `kitchensection` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kitchensection`
--

INSERT INTO `kitchensection` (`id`, `tenantId`, `branchId`, `name`) VALUES
('0bdff4cb-b14e-487d-86fc-051fca4c62d1', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'Cold Kitchen'),
('11e97a61-76f4-46c1-ad8f-a12ab49d258c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Cold Prep'),
('3a3c0f81-848f-4f2a-8bcc-6fba9c17ea8c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Pastry'),
('48e10bb3-8907-41dc-91b0-3cd427325fae', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'Juice Bar'),
('4ae85115-6587-427f-94f0-90028b793a98', '1986a50c-b166-4771-87df-3d37f61d66a2', 'd8e5ce7e-e653-4b4c-94dd-2381a1edda17', 'Grill'),
('56cb6da7-a9c6-4946-bbec-b653e594f851', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'Seafood Grill'),
('bb641136-80f6-4c93-a77b-0e4bb8cf74c9', '1986a50c-b166-4771-87df-3d37f61d66a2', 'd8e5ce7e-e653-4b4c-94dd-2381a1edda17', 'Hot Line'),
('bf383e74-1899-4a19-8bf2-5bd1ac732aa3', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Tandoor'),
('c49bd724-de43-4d2d-881a-0ce06d36c0d6', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Dessert'),
('ee854ccd-b10c-48b0-b442-d49b9d46e482', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'Curry Station');

-- --------------------------------------------------------

--
-- Table structure for table `leaverequest`
--

CREATE TABLE `leaverequest` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `leaveType` varchar(50) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `reason` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leaverequest`
--

INSERT INTO `leaverequest` (`id`, `tenantId`, `userId`, `startDate`, `endDate`, `leaveType`, `status`, `reason`, `createdAt`) VALUES
('5047c279-7cc1-4ad9-a793-43079ecf7b99', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '8d4313ef-208d-42db-b106-b20cfa240eee', '2026-07-20 06:46:21.122', '2026-07-21 06:46:21.122', 'ANNUAL', 'PENDING', 'Family event', '2026-07-13 06:46:21.128'),
('823194b3-5b39-4e60-a570-b4eb7c59b1b1', '1986a50c-b166-4771-87df-3d37f61d66a2', '11b7b3f8-176b-4c6c-abee-e704147c8446', '2026-07-20 06:46:20.950', '2026-07-21 06:46:20.950', 'ANNUAL', 'PENDING', 'Family event', '2026-07-13 06:46:20.956'),
('90e14a29-4f19-4fc1-bb69-1753f852f29d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'f75cc34f-03d6-4696-b442-bdc1e002470a', '2026-07-20 06:46:20.717', '2026-07-21 06:46:20.717', 'ANNUAL', 'PENDING', 'Family event', '2026-07-13 06:46:20.724'),
('91f0af1f-4686-41c6-91ba-3719983d5071', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'dea3cce1-10f7-42b8-b79e-c48858caabc8', '2026-07-11 06:46:21.646', '2026-07-12 06:46:21.646', 'SICK', 'APPROVED', 'Recovered — seeded sample', '2026-07-13 06:46:21.652'),
('a9051d70-45eb-4a0a-ba65-4530192319bb', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '55bafa81-28ef-4f1c-946d-d2207efa6ff1', '2026-07-11 06:46:20.724', '2026-07-12 06:46:20.724', 'SICK', 'APPROVED', 'Recovered — seeded sample', '2026-07-13 06:46:20.730'),
('ce9d331e-4d5d-4697-a806-463589603813', '1986a50c-b166-4771-87df-3d37f61d66a2', 'c7070bb9-d178-46c2-b474-d7896370f52f', '2026-07-11 06:46:20.953', '2026-07-12 06:46:20.953', 'SICK', 'APPROVED', 'Recovered — seeded sample', '2026-07-13 06:46:20.960'),
('d3b2252d-af25-4bcf-8e17-a2ae36187d28', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '2026-07-20 06:46:21.642', '2026-07-21 06:46:21.642', 'ANNUAL', 'PENDING', 'Family event', '2026-07-13 06:46:21.648'),
('dbf4ddf5-5743-4f94-9064-26638cded6ea', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '15b721bd-efde-4dd1-8e05-98bacb3d2879', '2026-07-11 06:46:21.124', '2026-07-12 06:46:21.125', 'SICK', 'APPROVED', 'Recovered — seeded sample', '2026-07-13 06:46:21.131');

-- --------------------------------------------------------

--
-- Table structure for table `marketingcampaign`
--

CREATE TABLE `marketingcampaign` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `channel` varchar(50) NOT NULL,
  `status` enum('DRAFT','SCHEDULED','SENT','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `audience` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `scheduledAt` datetime(3) DEFAULT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `marketingcampaign`
--

INSERT INTO `marketingcampaign` (`id`, `tenantId`, `name`, `channel`, `status`, `audience`, `content`, `scheduledAt`, `sentAt`, `createdAt`) VALUES
('1092c2b6-4e1f-41af-9913-223c41078296', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Happy Hour SMS', 'SMS', 'DRAFT', 'Local guests', 'Happy Hour 4–6pm: 2-for-1 selected drinks.', NULL, NULL, '2026-07-13 06:46:20.938'),
('12a792c1-ebcd-4d67-b6bc-156d62eb5630', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Weekend Brunch Push', 'EMAIL', 'SCHEDULED', 'Loyalty members', 'Join us for weekend brunch — 15% off with code BRUNCH15.', '2026-07-16 06:46:20.932', NULL, '2026-07-13 06:46:20.938'),
('144ebd04-5ce5-4d83-af0e-5dc617894c55', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Happy Hour SMS', 'SMS', 'DRAFT', 'Local guests', 'Happy Hour 4–6pm: 2-for-1 selected drinks.', NULL, NULL, '2026-07-13 06:46:21.626'),
('35a298b6-d149-449e-859c-cbcc4ee27250', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Weekend Brunch Push', 'EMAIL', 'SCHEDULED', 'Loyalty members', 'Join us for weekend brunch — 15% off with code BRUNCH15.', '2026-07-16 06:46:21.102', NULL, '2026-07-13 06:46:21.109'),
('3822afd2-8603-469b-a794-d1d5f2cb7fe0', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Spice Haven Kitchen Launch Promo', 'EMAIL', 'SCHEDULED', 'All customers', 'Welcome offer for Spice Haven Kitchen guests — 10% off your first visit.', '2026-07-13 05:23:32.492', NULL, '2026-07-13 05:23:33.103'),
('60105082-8dc1-428f-b939-570b5a4c5f15', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Ocean Bistro Launch Promo', 'EMAIL', 'SCHEDULED', 'All customers', 'Welcome offer for Ocean Bistro guests — 10% off your first visit.', '2026-07-13 05:23:33.128', NULL, '2026-07-13 05:23:33.353'),
('69017281-35cc-49cd-8029-6605382913d0', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Green Leaf Cafe Launch Promo', 'EMAIL', 'SCHEDULED', 'All customers', 'Welcome offer for Green Leaf Cafe guests — 10% off your first visit.', '2026-07-13 05:23:33.369', NULL, '2026-07-13 05:23:33.895'),
('85d2eae9-4fff-467d-952e-8958c48260ac', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Happy Hour SMS', 'SMS', 'DRAFT', 'Local guests', 'Happy Hour 4–6pm: 2-for-1 selected drinks.', NULL, NULL, '2026-07-13 06:46:20.692'),
('8c902473-2fc6-4216-ad13-39efd1f97e94', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Weekend Brunch Push', 'EMAIL', 'SCHEDULED', 'Loyalty members', 'Join us for weekend brunch — 15% off with code BRUNCH15.', '2026-07-16 06:46:21.619', NULL, '2026-07-13 06:46:21.626'),
('e2e0f7d6-db56-45f0-8653-16a81c703c31', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Happy Hour SMS', 'SMS', 'DRAFT', 'Local guests', 'Happy Hour 4–6pm: 2-for-1 selected drinks.', NULL, NULL, '2026-07-13 06:46:21.109'),
('fff78110-55c3-4e32-a8d1-126f2809cf02', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Weekend Brunch Push', 'EMAIL', 'SCHEDULED', 'Loyalty members', 'Join us for weekend brunch — 15% off with code BRUNCH15.', '2026-07-16 06:46:20.684', NULL, '2026-07-13 06:46:20.692');

-- --------------------------------------------------------

--
-- Table structure for table `menucategory`
--

CREATE TABLE `menucategory` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menucategory`
--

INSERT INTO `menucategory` (`id`, `tenantId`, `name`, `createdAt`, `deletedAt`) VALUES
('1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Hot Coffee', '2026-07-10 11:21:30.237', NULL),
('3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Iced Coffee & Teas', '2026-07-10 11:21:30.248', NULL),
('585cbab3-ef51-4be8-b4fa-be2d9c19e7f7', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Starters', '2026-07-13 05:23:33.035', NULL),
('8225c6be-016a-4ea7-b405-30933cea74cc', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Grill', '2026-07-13 05:23:33.312', NULL),
('9090da2c-4b8c-44d6-bd80-c97cdd0f0175', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Mains', '2026-07-13 05:23:33.048', NULL),
('b344ee3f-2228-4b9f-9f32-9353dd110326', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Breads & Rice', '2026-07-13 05:23:33.061', NULL),
('b7a19cbd-8f1d-435c-9ce8-d4e3eed40405', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Gourmet Mains', '2026-07-10 11:21:30.266', NULL),
('c94dc048-9a5b-4a7d-9a3d-5bf52688f344', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Desserts', '2026-07-13 05:23:33.320', NULL),
('d68c7773-9124-46e9-90ee-1b1b96d91a1c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Raw Bar', '2026-07-13 05:23:33.302', NULL),
('dbdbcaa0-c460-4893-8216-d08f9f4f0969', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Juices', '2026-07-13 05:23:33.852', NULL),
('edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Artisan Bakery', '2026-07-10 11:21:30.259', NULL),
('faf7018d-6b64-4bb8-afd0-c56605105043', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Bowls', '2026-07-13 05:23:33.839', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menuitem`
--

CREATE TABLE `menuitem` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `categoryId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT 1,
  `happyHourPrice` decimal(10,2) DEFAULT NULL,
  `happyHourStart` varchar(5) DEFAULT NULL,
  `happyHourEnd` varchar(5) DEFAULT NULL,
  `isCombo` tinyint(1) NOT NULL DEFAULT 0,
  `comboItems` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menuitem`
--

INSERT INTO `menuitem` (`id`, `tenantId`, `categoryId`, `name`, `description`, `price`, `imageUrl`, `isAvailable`, `happyHourPrice`, `happyHourStart`, `happyHourEnd`, `isCombo`, `comboItems`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('07241042-e818-4b00-9e5d-93c1e2bbaed9', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'd68c7773-9124-46e9-90ee-1b1b96d91a1c', 'Oysters on the Half Shell', 'Half dozen Pacific oysters with mignonette.', 24.00, '/uploads/1783931012161-images (5).jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.304', '2026-07-13 08:23:33.988', NULL),
('0b8cfada-763a-45f2-accc-440c0a3ebe9e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Caramel Latte', 'Velvety espresso combined with steamed milk and sweet, rich caramel syrup.', 4.50, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.296', '2026-07-10 11:21:30.296', NULL),
('0df6d47c-9219-4df4-8234-4e033fed3ecb', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'd68c7773-9124-46e9-90ee-1b1b96d91a1c', 'Tuna Tartare', 'Yellowfin tuna, avocado, sesame, citrus.', 18.00, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.308', '2026-07-13 05:23:33.308', NULL),
('15813cd0-017c-4e40-a2b7-5f2f311c0f70', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Americano Classic', 'Double espresso shots diluted with clean hot water for a smooth body.', 3.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.311', '2026-07-10 11:21:30.311', NULL),
('1722e639-c48e-4185-be6e-24d17cae8e12', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'Blueberry Scone', 'Traditional English cream scone folded with plump organic blueberries.', 3.60, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.402', '2026-07-10 11:21:30.402', NULL),
('22054f1a-2c23-4eba-8a1e-408e95a08767', '1986a50c-b166-4771-87df-3d37f61d66a2', '9090da2c-4b8c-44d6-bd80-c97cdd0f0175', 'Butter Chicken', 'Tomato-butter gravy with tender chicken.', 420.00, '/uploads/1783930812119-images (2).jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.050', '2026-07-13 08:20:14.430', NULL),
('2633b983-aeb0-4109-8a7b-11440f13ec28', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'Artisan Butter Croissant', 'Flaky, buttery French golden croissant baked fresh at sunrise.', 3.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.376', '2026-07-10 11:21:30.376', NULL),
('352876fb-0471-428b-8973-22e67c005f59', '1986a50c-b166-4771-87df-3d37f61d66a2', '585cbab3-ef51-4be8-b4fa-be2d9c19e7f7', 'Chicken Seekh Kebab', 'Minced chicken skewers with garam masala.', 320.00, '/uploads/1783930841284-images (3).jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.045', '2026-07-13 08:20:43.493', NULL),
('3f18ca8f-d7c3-451c-81dd-3fa3443355b1', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Nitro Cold Brew', 'Slow-steeped cold brew infused with nitrogen for a velvety cascaded head.', 5.25, '/uploads/1783924531669-images (1).jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.359', '2026-07-13 06:35:35.194', NULL),
('46274c5f-ec5a-4db7-898d-5d43e23004e7', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'b7a19cbd-8f1d-435c-9ce8-d4e3eed40405', 'Crispy French Fries', 'Hand-cut russet potatoes fried to golden perfection, tossed in sea salt and parsley.', 4.50, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.444', '2026-07-10 11:21:30.444', NULL),
('4c1aa22b-0d74-4e77-a27b-ca34e43d83d3', '1986a50c-b166-4771-87df-3d37f61d66a2', 'b344ee3f-2228-4b9f-9f32-9353dd110326', 'Garlic Naan', 'Tandoor-baked flatbread with garlic butter.', 80.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.064', '2026-07-13 05:23:33.064', NULL),
('6f45830e-3ab7-4961-b33e-58759caeb254', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'c94dc048-9a5b-4a7d-9a3d-5bf52688f344', 'Key Lime Pie', 'Classic Florida-style pie with whipped cream.', 11.00, '/uploads/1783930978538-images (4).jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.322', '2026-07-13 08:23:00.686', NULL),
('716ea476-d142-458e-afde-b092d2a8098f', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'Almond Croissant', 'Double baked butter croissant filled with marzipan cream and sliced almonds.', 4.25, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.413', '2026-07-10 11:21:30.413', NULL),
('73f3f62c-d7bb-4d14-8a8d-23af11f15b77', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Traditional Cappuccino', 'Double espresso pulled over steamed whole milk and deep velvety foam layers.', 3.90, 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.283', '2026-07-10 11:21:30.283', NULL),
('7ef185c0-0b7d-43fd-ba17-ab7bff771d8e', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'dbdbcaa0-c460-4893-8216-d08f9f4f0969', 'Turmeric Latte', 'Golden milk with oat milk and honey.', 4.20, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.859', '2026-07-13 05:23:33.859', NULL),
('828089f4-284b-4ca2-8ec2-3afb6e309daa', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '8225c6be-016a-4ea7-b405-30933cea74cc', 'Grilled Salmon', 'Atlantic salmon, lemon butter, seasonal vegetables.', 32.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.314', '2026-07-13 05:23:33.314', NULL),
('84a63875-49b1-4b57-86b1-cb545b0fe08f', '1986a50c-b166-4771-87df-3d37f61d66a2', 'b344ee3f-2228-4b9f-9f32-9353dd110326', 'Jeera Rice', 'Basmati rice tempered with cumin.', 150.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.067', '2026-07-13 05:23:33.067', NULL),
('878cb585-56c0-44d4-b4cd-068741d90fc1', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Iced Chai Latte', 'Sweet, spiced black tea concentrate mixed with chilled milk and ice cubes.', 4.70, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.367', '2026-07-10 11:21:30.367', NULL),
('8d20b074-e8d5-4bf3-9fc9-3e6edc04f7f7', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Classic Flat White', 'Smooth microfoam poured over a double shot of rich espresso blend.', 4.00, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.303', '2026-07-10 11:21:30.303', NULL),
('947fe1c8-10cc-4f63-b28d-8b33cf845e57', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'b7a19cbd-8f1d-435c-9ce8-d4e3eed40405', 'Avocado Toast Artisan', 'Sourdough toast topped with fresh mashed avocado, feta cheese, and cherry tomatoes.', 8.50, 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.422', '2026-07-10 11:21:30.422', NULL),
('9702f4f1-398a-4153-bb4e-9d9071a69ea3', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'b7a19cbd-8f1d-435c-9ce8-d4e3eed40405', 'Smoked Salmon Bagel', 'Toasted sesame bagel spread with dill cream cheese, capers, onions, and wild smoked salmon.', 11.20, 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.429', '2026-07-10 11:21:30.429', NULL),
('971bcf61-079d-43e7-a926-e6b7410b4684', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Mocha Delight', 'Rich dark chocolate syrup mixed with double espresso and velvety steamed milk.', 4.80, 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.318', '2026-07-10 11:21:30.318', NULL),
('9fd86210-52b6-4d57-9475-96d84f54524a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'b7a19cbd-8f1d-435c-9ce8-d4e3eed40405', 'Gourmet Beef Burger', 'Prime Angus beef patty, cheddar cheese, butter lettuce, and house sauce on toasted brioche.', 12.80, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.437', '2026-07-10 11:21:30.437', NULL),
('a9db82d7-dc68-406a-9a17-41ebeb762677', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '8225c6be-016a-4ea7-b405-30933cea74cc', 'Lobster Roll', 'Warm buttered lobster on toasted brioche.', 36.00, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.317', '2026-07-13 05:23:33.317', NULL),
('aea1e7e4-7ab5-4697-ac2f-996d03212500', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'faf7018d-6b64-4bb8-afd0-c56605105043', 'Acai Smoothie Bowl', 'Acai, banana, granola, berries.', 9.50, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.848', '2026-07-13 05:23:33.848', NULL),
('c5464e6d-cf59-4991-af8a-ffc786015cec', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'faf7018d-6b64-4bb8-afd0-c56605105043', 'Buddha Bowl', 'Quinoa, roasted veg, tahini, seeds.', 12.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.843', '2026-07-13 05:23:33.843', NULL),
('cdcbdd0e-4313-43e2-bdec-43c010ae8407', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Cold Brew Velvet', '24-hour slow-steeped craft cold brew topped with heavy sweet cream vanilla pour.', 4.80, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.326', '2026-07-10 11:21:30.326', NULL),
('d0ba1903-ed97-42bf-9f7c-42a1fdd202a5', '1986a50c-b166-4771-87df-3d37f61d66a2', '585cbab3-ef51-4be8-b4fa-be2d9c19e7f7', 'Paneer Tikka', 'Charcoal-grilled cottage cheese with mint chutney.', 280.00, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.039', '2026-07-13 05:23:33.039', NULL),
('d4d7e675-6de8-40ad-878d-9b941213a79d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Iced Passionfruit Tea', 'Brewed herbal hibiscus and passionfruit tea shaken with ice and organic honey.', 4.20, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.352', '2026-07-10 11:21:30.352', NULL),
('d8fa23a0-8c07-448c-878b-01e36202cad7', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'dbdbcaa0-c460-4893-8216-d08f9f4f0969', 'Green Detox Juice', 'Kale, apple, ginger, cucumber.', 5.50, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.855', '2026-07-13 05:23:33.855', NULL),
('dd5ffcce-7099-4ea8-ba5f-359b91b96bd9', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'Chocolate Fudge Muffin', 'Decadent chocolate muffin loaded with rich molten fudge baking chips.', 3.80, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.384', '2026-07-10 11:21:30.384', NULL),
('ddbbe039-9ddc-4a75-80dd-1bd8ddf03bcc', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'edf0d62d-b3d4-4dfe-b1ce-15e9a6d4914e', 'Cinnamon Roll Supreme', 'Warm glazed roll loaded with sweet brown sugar cinnamon layers.', 4.10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.393', '2026-07-10 11:21:30.393', NULL),
('edb807a8-6644-484f-842a-85046a2eac36', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Iced Caramel Macchiato', 'Espresso poured over milk, vanilla syrup, and ice, finished with caramel drizzle.', 4.95, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.333', '2026-07-10 11:21:30.333', NULL),
('f3afdb8c-ff6b-4cea-9402-9b6c24e26c5e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1ff94c31-f1a2-4ea6-9b45-c0dfc0e61709', 'Espresso Solo', 'Single origin rich, dark pulled espresso shot with hazelnut crema.', 2.50, '/uploads/1783924511111-images.jpg', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.273', '2026-07-13 06:35:13.579', NULL),
('f683b1b7-8a92-4d99-aeb0-75128a05bf4c', '1986a50c-b166-4771-87df-3d37f61d66a2', '9090da2c-4b8c-44d6-bd80-c97cdd0f0175', 'Dal Makhani', 'Slow-cooked black lentils with cream.', 260.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-13 05:23:33.054', '2026-07-13 05:23:33.054', NULL),
('f8d50dc9-4230-429d-b077-ed4a420e9faa', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3dfa282a-2aed-48dd-b4b7-4ab835386e7d', 'Matcha Green Tea Latte', 'Stone-ground Uji matcha whisked with milk over ice for an earthy refreshment.', 5.10, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600', 1, NULL, NULL, NULL, 0, NULL, '2026-07-10 11:21:30.342', '2026-07-10 11:21:30.342', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menumodifier`
--

CREATE TABLE `menumodifier` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `menuItemId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `isAvailable` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menumodifier`
--

INSERT INTO `menumodifier` (`id`, `tenantId`, `menuItemId`, `name`, `price`, `isAvailable`) VALUES
('00208f32-34ed-41fb-8358-dacdf8b42375', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'cdcbdd0e-4313-43e2-bdec-43c010ae8407', 'Sweet Vanilla Cold Foam', 1.00, 1),
('bcd1791d-e350-4d29-be52-86005a342d8f', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '0b8cfada-763a-45f2-accc-440c0a3ebe9e', 'Extra Shot Espresso', 0.80, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` enum('ALERT','INFO','SYSTEM') NOT NULL DEFAULT 'INFO',
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nutritioninfo`
--

CREATE TABLE `nutritioninfo` (
  `id` varchar(36) NOT NULL,
  `menuItemId` varchar(36) NOT NULL,
  `calories` int(11) NOT NULL DEFAULT 0,
  `allergens` text DEFAULT NULL,
  `protein` decimal(6,2) NOT NULL DEFAULT 0.00,
  `carbs` decimal(6,2) NOT NULL DEFAULT 0.00,
  `fat` decimal(6,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `orderNumber` varchar(100) NOT NULL,
  `type` enum('DINE_IN','TAKE_AWAY','DELIVERY','ONLINE') NOT NULL DEFAULT 'ONLINE',
  `status` enum('PENDING','PREPARING','READY','SERVED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `tableId` varchar(36) DEFAULT NULL,
  `customerId` varchar(36) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `tenantId`, `branchId`, `orderNumber`, `type`, `status`, `tableId`, `customerId`, `subtotal`, `tax`, `discount`, `totalAmount`, `createdAt`, `updatedAt`) VALUES
('06f3521f-5398-461e-a49c-bdb2b63f0bbe', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1009', 'ONLINE', 'PENDING', NULL, NULL, 90.00, 4.50, 0.00, 94.50, '2026-07-13 06:40:21.057', '2026-07-13 06:40:21.057'),
('09a776df-244e-4355-8ecd-cc59125b0c53', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1004', 'DINE_IN', 'SERVED', 'a26497e6-50ce-4f03-a819-bb37b3dc6a18', NULL, 48.40, 2.42, 0.00, 50.82, '2026-07-13 04:46:21.198', '2026-07-13 04:46:21.198'),
('124ccae8-3165-4055-b80c-9d07b969ce3c', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1008', 'TAKE_AWAY', 'PREPARING', NULL, NULL, 10.25, 0.51, 0.00, 10.76, '2026-07-13 06:34:20.612', '2026-07-13 06:34:20.612'),
('182269a7-55a2-4f94-b50b-c1901c8b2ee1', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1002', 'DINE_IN', 'PREPARING', '5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', NULL, 10.25, 0.51, 0.00, 10.76, '2026-07-13 06:10:20.571', '2026-07-13 06:10:20.571'),
('1f0ddfb2-b06c-4ba7-a951-88a56858b626', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1003', 'TAKE_AWAY', 'READY', NULL, NULL, 1320.00, 66.00, 0.00, 1386.00, '2026-07-13 05:46:20.826', '2026-07-13 05:46:20.826'),
('383fe2e4-e331-426b-8d3a-2d6cae03accd', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1004', 'DINE_IN', 'SERVED', '5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', NULL, 30.75, 1.54, 0.00, 32.29, '2026-07-13 04:46:20.587', '2026-07-13 04:46:20.587'),
('4261c0dd-118b-43ab-8ffb-29c4f4717b1d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1003', 'TAKE_AWAY', 'READY', NULL, NULL, 13.75, 0.69, 0.00, 14.44, '2026-07-13 05:46:20.577', '2026-07-13 05:46:20.577'),
('4be6fb14-b15a-4de6-a6bb-7998ebf64479', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1009', 'ONLINE', 'PENDING', NULL, NULL, 40.00, 2.00, 0.00, 42.00, '2026-07-13 06:40:21.481', '2026-07-13 06:40:21.481'),
('4c9196e0-e7c8-4741-b61a-fda953ee165e', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1007', 'DINE_IN', 'COMPLETED', '0e5935a4-33c1-4000-86eb-9ff3dbf71c43', NULL, 1480.00, 74.00, 0.00, 1554.00, '2026-07-13 01:46:20.858', '2026-07-13 01:46:20.858'),
('55c887fb-1cbd-4388-bc09-803521f7b6eb', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1008', 'TAKE_AWAY', 'PREPARING', NULL, NULL, 1060.00, 53.00, 0.00, 1113.00, '2026-07-13 06:34:20.863', '2026-07-13 06:34:20.863'),
('67231acb-f1a2-4997-ab96-ef43abc1640b', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1006', 'DELIVERY', 'COMPLETED', NULL, NULL, 40.00, 2.00, 0.00, 42.00, '2026-07-13 02:46:21.273', '2026-07-13 02:46:21.273'),
('6725959a-fe70-4d67-b81d-6c12f1376230', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1006', 'DELIVERY', 'COMPLETED', NULL, NULL, 1320.00, 66.00, 0.00, 1386.00, '2026-07-13 02:46:20.848', '2026-07-13 02:46:20.848'),
('69536c20-af61-44a8-9d1b-99fab2f54b91', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1003', 'TAKE_AWAY', 'READY', NULL, NULL, 40.00, 2.00, 0.00, 42.00, '2026-07-13 05:46:21.191', '2026-07-13 05:46:21.191'),
('7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1010', 'DELIVERY', 'READY', NULL, NULL, 1480.00, 74.00, 0.00, 1554.00, '2026-07-13 05:58:20.880', '2026-07-13 05:58:20.880'),
('7db3bb85-eee8-469f-bd31-2053bc931c21', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1008', 'TAKE_AWAY', 'PREPARING', NULL, NULL, 54.00, 2.70, 0.00, 56.70, '2026-07-13 06:34:21.051', '2026-07-13 06:34:21.051'),
('7f186c88-2a7b-4aea-b789-956d3034fc32', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1007', 'DINE_IN', 'COMPLETED', 'b7de425e-d8b9-4588-8d09-b57ebae34559', NULL, 138.00, 6.90, 0.00, 144.90, '2026-07-13 01:46:21.045', '2026-07-13 01:46:21.045'),
('8906a01a-5dd6-48b1-a294-f370517ef827', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1003', 'TAKE_AWAY', 'READY', NULL, NULL, 90.00, 4.50, 0.00, 94.50, '2026-07-13 05:46:21.026', '2026-07-13 05:46:21.026'),
('9549c8d6-69bd-4193-9469-a72e68ae1d20', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1005', 'ONLINE', 'COMPLETED', NULL, NULL, 10.25, 0.51, 0.00, 10.76, '2026-07-13 03:46:20.594', '2026-07-13 03:46:20.594'),
('9ed96bf3-9378-4e24-bda3-6e52763b5fdc', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1002', 'DINE_IN', 'PREPARING', '0e5935a4-33c1-4000-86eb-9ff3dbf71c43', NULL, 1060.00, 53.00, 0.00, 1113.00, '2026-07-13 06:10:20.821', '2026-07-13 06:10:20.821'),
('a5dc5ba9-120c-42ab-8fb6-b9bf6e66602f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1004', 'DINE_IN', 'SERVED', 'b7de425e-d8b9-4588-8d09-b57ebae34559', NULL, 138.00, 6.90, 0.00, 144.90, '2026-07-13 04:46:21.030', '2026-07-13 04:46:21.030'),
('a7de96f0-1871-4a1a-bab7-2688b590b47e', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1007', 'DINE_IN', 'COMPLETED', 'a26497e6-50ce-4f03-a819-bb37b3dc6a18', NULL, 48.40, 2.42, 0.00, 50.82, '2026-07-13 01:46:21.385', '2026-07-13 01:46:21.385'),
('ac79549a-4918-426d-b011-9c701dcb02ac', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1004', 'DINE_IN', 'SERVED', '0e5935a4-33c1-4000-86eb-9ff3dbf71c43', NULL, 1480.00, 74.00, 0.00, 1554.00, '2026-07-13 04:46:20.834', '2026-07-13 04:46:20.834'),
('b4ec537e-e906-4f71-ae7f-4a0c59467482', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1001', 'DINE_IN', 'PENDING', 'a26497e6-50ce-4f03-a819-bb37b3dc6a18', NULL, 48.40, 2.42, 0.00, 50.82, '2026-07-13 06:28:21.178', '2026-07-13 06:28:21.178'),
('bd667c7f-8c1f-4dec-9a34-c45fd61e5456', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1005', 'ONLINE', 'COMPLETED', NULL, NULL, 1060.00, 53.00, 0.00, 1113.00, '2026-07-13 03:46:20.841', '2026-07-13 03:46:20.841'),
('be56c5cf-c227-4f0f-9f7c-939c4384e750', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1005', 'ONLINE', 'COMPLETED', NULL, NULL, 34.50, 1.73, 0.00, 36.23, '2026-07-13 03:46:21.241', '2026-07-13 03:46:21.241'),
('bf2728fc-1c77-4831-bd12-e9e545939401', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1001', 'DINE_IN', 'PENDING', '0e5935a4-33c1-4000-86eb-9ff3dbf71c43', NULL, 1480.00, 74.00, 0.00, 1554.00, '2026-07-13 06:28:20.814', '2026-07-13 06:28:20.814'),
('c8216e03-86fd-449a-863f-f9b69cd8f5fa', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'ORD-1009', 'ONLINE', 'PENDING', NULL, NULL, 1320.00, 66.00, 0.00, 1386.00, '2026-07-13 06:40:20.875', '2026-07-13 06:40:20.875'),
('cc499edb-fd28-4bb1-8ec3-04717abb5828', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1006', 'DELIVERY', 'COMPLETED', NULL, NULL, 13.75, 0.69, 0.00, 14.44, '2026-07-13 02:46:20.600', '2026-07-13 02:46:20.600'),
('cdae1da7-786a-4e68-b1e2-06275a45903a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1005', 'ONLINE', 'COMPLETED', NULL, NULL, 54.00, 2.70, 0.00, 56.70, '2026-07-13 03:46:21.038', '2026-07-13 03:46:21.038'),
('d05fc3f1-57e7-4759-b78f-41480813356e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1001', 'DINE_IN', 'PENDING', '5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', NULL, 30.75, 1.54, 0.00, 32.29, '2026-07-13 06:28:20.546', '2026-07-13 06:28:20.546'),
('d2373e00-d7d0-43b1-98fd-dc49c69e8ebb', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1010', 'DELIVERY', 'READY', NULL, NULL, 138.00, 6.90, 0.00, 144.90, '2026-07-13 05:58:21.061', '2026-07-13 05:58:21.061'),
('d397762d-955f-4732-84cd-bd5337c9492a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1001', 'DINE_IN', 'PENDING', 'b7de425e-d8b9-4588-8d09-b57ebae34559', NULL, 138.00, 6.90, 0.00, 144.90, '2026-07-13 06:28:21.014', '2026-07-13 06:28:21.014'),
('d4e90dd9-4aac-40d7-a067-5aeedec06ce0', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1008', 'TAKE_AWAY', 'PREPARING', NULL, NULL, 34.50, 1.73, 0.00, 36.23, '2026-07-13 06:34:21.409', '2026-07-13 06:34:21.409'),
('e3f8de16-5dd9-449e-b4ea-f314b18c9c1d', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1007', 'DINE_IN', 'COMPLETED', '5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', NULL, 30.75, 1.54, 0.00, 32.29, '2026-07-13 01:46:20.607', '2026-07-13 01:46:20.607'),
('ec7c9816-1501-49f1-9cee-4d4728dc9322', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1010', 'DELIVERY', 'READY', NULL, NULL, 48.40, 2.42, 0.00, 50.82, '2026-07-13 05:58:21.492', '2026-07-13 05:58:21.492'),
('f18035db-a2f4-4dc2-9dda-8e48ee73b1c0', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1002', 'DINE_IN', 'PREPARING', 'b7de425e-d8b9-4588-8d09-b57ebae34559', NULL, 54.00, 2.70, 0.00, 56.70, '2026-07-13 06:10:21.022', '2026-07-13 06:10:21.022'),
('f2c429a9-c354-4945-adb4-e1872e75fc6c', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1010', 'DELIVERY', 'READY', NULL, NULL, 30.75, 1.54, 0.00, 32.29, '2026-07-13 05:58:20.626', '2026-07-13 05:58:20.626'),
('f405aec6-6ae0-41b5-ba05-5f0a1fdb72d3', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'ORD-1002', 'DINE_IN', 'PREPARING', 'a26497e6-50ce-4f03-a819-bb37b3dc6a18', NULL, 34.50, 1.73, 0.00, 36.23, '2026-07-13 06:10:21.185', '2026-07-13 06:10:21.185'),
('fc1406d9-b263-430a-b84d-d17a19d3994c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', 'ORD-1006', 'DELIVERY', 'COMPLETED', NULL, NULL, 90.00, 4.50, 0.00, 94.50, '2026-07-13 02:46:21.042', '2026-07-13 02:46:21.042'),
('fda40b2f-371f-4979-8a4f-5775fdae62bc', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', 'ORD-1009', 'ONLINE', 'PENDING', NULL, NULL, 13.75, 0.69, 0.00, 14.44, '2026-07-13 06:40:20.621', '2026-07-13 06:40:20.621');

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `menuItemId` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `menuItemId`, `quantity`, `unitPrice`) VALUES
('010a33b8-bbec-41aa-9eb8-e8c086f2459b', '9549c8d6-69bd-4193-9469-a72e68ae1d20', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('045b0d86-929b-4072-9915-51a07229412a', '6725959a-fe70-4d67-b81d-6c12f1376230', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('0733d3cc-654f-4457-86de-2c8ab332f69c', 'ec7c9816-1501-49f1-9cee-4d4728dc9322', '7ef185c0-0b7d-43fd-ba17-ab7bff771d8e', 2, 4.20),
('0991fea5-3b11-418a-b4d6-fef6dfe5347d', 'a5dc5ba9-120c-42ab-8fb6-b9bf6e66602f', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('0a30d582-ac72-48a9-9eeb-fb3f11051878', 'a5dc5ba9-120c-42ab-8fb6-b9bf6e66602f', '07241042-e818-4b00-9e5d-93c1e2bbaed9', 2, 24.00),
('0d750645-8abf-4cd0-b5f3-9cd2f77ec725', 'd2373e00-d7d0-43b1-98fd-dc49c69e8ebb', '07241042-e818-4b00-9e5d-93c1e2bbaed9', 2, 24.00),
('0e5977c3-d2af-481c-a882-771b30259ba0', '182269a7-55a2-4f94-b50b-c1901c8b2ee1', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('0ecf88b7-edbd-4710-9be0-ead291538dd5', 'a5dc5ba9-120c-42ab-8fb6-b9bf6e66602f', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('11479a82-7f45-4378-9bbf-ca10c6669bef', '9ed96bf3-9378-4e24-bda3-6e52763b5fdc', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('124c33d5-f9d5-46df-acb6-5e15eaab041f', 'fc1406d9-b263-430a-b84d-d17a19d3994c', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('137a50ee-788b-4217-9d9d-921b57252e3b', 'fda40b2f-371f-4979-8a4f-5775fdae62bc', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('13a77f00-a367-4175-9a5f-0035a8ebd07b', 'bf2728fc-1c77-4831-bd12-e9e545939401', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('15bab2a7-534e-412c-9fab-ca5b21427b46', 'e3f8de16-5dd9-449e-b4ea-f314b18c9c1d', '947fe1c8-10cc-4f63-b28d-8b33cf845e57', 2, 8.50),
('18f754dc-f656-48ab-a211-1b507b3865f3', 'a7de96f0-1871-4a1a-bab7-2688b590b47e', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('18fbdefe-05a3-4dbd-a538-4e362b6535c0', '06f3521f-5398-461e-a49c-bdb2b63f0bbe', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('19e39efd-384b-4100-b447-3368f5e5dd6a', 'ec7c9816-1501-49f1-9cee-4d4728dc9322', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('1c5349b6-d28f-4191-a9eb-8e1f82f12183', 'f2c429a9-c354-4945-adb4-e1872e75fc6c', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('1e9228b8-c184-46c7-940d-1cd77ad2f59d', 'd4e90dd9-4aac-40d7-a067-5aeedec06ce0', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('1eb14368-0908-41cf-8482-67274a7f0872', '4261c0dd-118b-43ab-8ffb-29c4f4717b1d', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('1fb890c2-c6c0-4a24-b06f-3728d6065574', '4c9196e0-e7c8-4741-b61a-fda953ee165e', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('202f30d0-d872-4188-b2c7-e611581f3a55', '9549c8d6-69bd-4193-9469-a72e68ae1d20', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('22305b50-b63a-41c4-8b53-c8e9191c742b', '06f3521f-5398-461e-a49c-bdb2b63f0bbe', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('294d33c2-665e-4eb4-ba08-e16a8ea5e97b', 'fc1406d9-b263-430a-b84d-d17a19d3994c', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('2a529e95-b2c0-496b-915d-c457160a4223', 'cdae1da7-786a-4e68-b1e2-06275a45903a', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('2edddacb-6e5a-4297-909a-df6d304f9d70', '69536c20-af61-44a8-9d1b-99fab2f54b91', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('3103b2f0-afad-4ced-9c03-c96e541d8b7e', '7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('31f75069-ebb7-4ded-b485-d9048ece9194', 'a5dc5ba9-120c-42ab-8fb6-b9bf6e66602f', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('32900fea-73a8-4934-9384-fc21e2a2008d', '09a776df-244e-4355-8ecd-cc59125b0c53', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('34491812-f025-4c9c-8ef8-bbc8e0590e56', 'cc499edb-fd28-4bb1-8ec3-04717abb5828', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('344f54a3-23cc-429a-83a5-65d28b814111', '4be6fb14-b15a-4de6-a6bb-7998ebf64479', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('3472d2da-2354-4a32-8c45-48d184c0e681', 'd397762d-955f-4732-84cd-bd5337c9492a', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('36e49d91-d5bf-4760-acdf-03c67886b65d', 'd397762d-955f-4732-84cd-bd5337c9492a', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('3bf8aadb-fa90-4dc0-9458-42441550183c', '383fe2e4-e331-426b-8d3a-2d6cae03accd', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('3c4e2e92-cacd-470f-b39c-ba8a4f58034e', 'ac79549a-4918-426d-b011-9c701dcb02ac', '4c1aa22b-0d74-4e77-a27b-ca34e43d83d3', 2, 80.00),
('3f02062d-2bfe-4bf5-b42a-34f4055ef81c', 'bf2728fc-1c77-4831-bd12-e9e545939401', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('41303cfe-0d9b-4008-add1-5b2c2a7f1e8e', 'bf2728fc-1c77-4831-bd12-e9e545939401', '4c1aa22b-0d74-4e77-a27b-ca34e43d83d3', 2, 80.00),
('41d043e4-edd9-4852-bdcc-c792b007e809', 'b4ec537e-e906-4f71-ae7f-4a0c59467482', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('424fbdd2-bcbc-4db3-bc35-bf7ed0fa296d', 'd05fc3f1-57e7-4759-b78f-41480813356e', '947fe1c8-10cc-4f63-b28d-8b33cf845e57', 2, 8.50),
('43082c3e-955e-41e5-81ee-8190f4b4e5f6', '7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('44f58a61-5f87-485d-9733-bef11d0fb79d', 'd05fc3f1-57e7-4759-b78f-41480813356e', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('461c1827-417a-4deb-9583-0ab400120040', 'cdae1da7-786a-4e68-b1e2-06275a45903a', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('464f5b79-39c0-4e39-a646-660d2e5d5144', '7f186c88-2a7b-4aea-b789-956d3034fc32', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('47a27f4b-45a0-4281-ae9b-d269496fd652', '7f186c88-2a7b-4aea-b789-956d3034fc32', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('481ba032-d6c5-447c-bde5-609281b0af9c', 'be56c5cf-c227-4f0f-9f7c-939c4384e750', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('4a6138ef-b7d6-4aac-94cc-58163b312a39', '383fe2e4-e331-426b-8d3a-2d6cae03accd', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('4b7df886-6be1-4e8a-86e3-25d82d529c54', 'f2c429a9-c354-4945-adb4-e1872e75fc6c', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('4c7d6e7d-e869-4d36-a568-cdc1b9df09e1', 'a7de96f0-1871-4a1a-bab7-2688b590b47e', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('4d8b68ee-e7ca-40c3-9b9c-756c938d9cab', 'd4e90dd9-4aac-40d7-a067-5aeedec06ce0', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('4e86c895-b1ed-4119-8dbe-9a0e47c58dc5', 'e3f8de16-5dd9-449e-b4ea-f314b18c9c1d', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('4fd769ce-5fff-4b54-ae0d-81e29289c608', 'e3f8de16-5dd9-449e-b4ea-f314b18c9c1d', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('50036cee-5bc1-43e6-ad05-ecd1a67254b1', 'be56c5cf-c227-4f0f-9f7c-939c4384e750', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('50f414ec-dc6d-40bf-92f5-e190b1d83027', '67231acb-f1a2-4997-ab96-ef43abc1640b', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('525ce038-5f7c-4a02-b55f-939b940c5773', '8906a01a-5dd6-48b1-a294-f370517ef827', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('555e6afa-cd07-4ab2-8b5a-2693250fa24e', '182269a7-55a2-4f94-b50b-c1901c8b2ee1', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('5d7f4db3-4c23-4119-880f-c1115ac622b5', 'bf2728fc-1c77-4831-bd12-e9e545939401', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('638f9270-116f-44a2-8081-28dc53a89e53', '6725959a-fe70-4d67-b81d-6c12f1376230', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('640dc1b1-89c5-4e56-9727-e9e03a185271', '67231acb-f1a2-4997-ab96-ef43abc1640b', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('64894aac-ea27-4f23-b7f3-71f37d05d4bd', 'ac79549a-4918-426d-b011-9c701dcb02ac', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('65e3b329-998a-43a2-ae6f-abe08f2ea313', 'f2c429a9-c354-4945-adb4-e1872e75fc6c', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('687eda44-e1ee-416f-b800-247ba7e646f5', 'ac79549a-4918-426d-b011-9c701dcb02ac', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('6b940d22-a06e-459b-aac0-013015237bb1', '9ed96bf3-9378-4e24-bda3-6e52763b5fdc', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('71d70e0b-f498-4559-93c7-b922f8c1adaa', '124ccae8-3165-4055-b80c-9d07b969ce3c', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('71daf784-36f8-44db-bc02-d05e8ae78cc6', 'd2373e00-d7d0-43b1-98fd-dc49c69e8ebb', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('74e41cf3-8dba-4885-b552-3722dfef55a0', 'bd667c7f-8c1f-4dec-9a34-c45fd61e5456', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('79b2e61d-9a58-45d4-a175-42e491b29584', 'c8216e03-86fd-449a-863f-f9b69cd8f5fa', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('7e1e12b7-6bd7-4e8f-a8af-c66ba942a857', '7f186c88-2a7b-4aea-b789-956d3034fc32', '07241042-e818-4b00-9e5d-93c1e2bbaed9', 2, 24.00),
('8041b77e-7892-4957-8fed-585774df7024', 'f405aec6-6ae0-41b5-ba05-5f0a1fdb72d3', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('82e043c9-15e9-4524-a2f6-af4eb0345d92', '383fe2e4-e331-426b-8d3a-2d6cae03accd', '947fe1c8-10cc-4f63-b28d-8b33cf845e57', 2, 8.50),
('842598af-94c0-4780-a12e-ae90f8f82f8b', 'c8216e03-86fd-449a-863f-f9b69cd8f5fa', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('85fba0b7-3638-4a7c-94d7-c297f41c00eb', '09a776df-244e-4355-8ecd-cc59125b0c53', '7ef185c0-0b7d-43fd-ba17-ab7bff771d8e', 2, 4.20),
('88d5e3a0-ece4-4b23-894e-a05f49be6251', 'd05fc3f1-57e7-4759-b78f-41480813356e', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('8d1fb81d-aae1-4b15-8a89-4ea4bd9392ea', 'ec7c9816-1501-49f1-9cee-4d4728dc9322', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('90875ca6-3677-47f5-bf96-3de2079f8058', 'd2373e00-d7d0-43b1-98fd-dc49c69e8ebb', 'a9db82d7-dc68-406a-9a17-41ebeb762677', 1, 36.00),
('91b01c6a-69cb-41fc-b2ff-6c1756d1ee92', '7f186c88-2a7b-4aea-b789-956d3034fc32', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('998eb9e4-8ee9-41e3-bf3a-2791192bf304', 'ec7c9816-1501-49f1-9cee-4d4728dc9322', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('9ab7948e-4a49-4675-8f15-639ab3fbf07d', '4261c0dd-118b-43ab-8ffb-29c4f4717b1d', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('9ad97b78-db4b-4aae-bbd4-2a565ce0b11e', 'b4ec537e-e906-4f71-ae7f-4a0c59467482', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('9beee405-d722-4eba-a12f-2eb6a8f60970', '6725959a-fe70-4d67-b81d-6c12f1376230', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('9bf73687-ed4b-4d60-872d-131166baea4c', 'e3f8de16-5dd9-449e-b4ea-f314b18c9c1d', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('9e466845-fbf7-43a0-ab9c-a77f2fec6837', 'fda40b2f-371f-4979-8a4f-5775fdae62bc', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('a0a2b55c-260d-4e36-a682-cbf9f50a80b3', '4c9196e0-e7c8-4741-b61a-fda953ee165e', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('a13e4e38-425f-437d-825a-5c01a1c45e17', '67231acb-f1a2-4997-ab96-ef43abc1640b', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('a1b0d852-de55-46a1-ab4d-4ef62026af6f', '4be6fb14-b15a-4de6-a6bb-7998ebf64479', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('a5a64b4b-f548-4290-baaa-7b813f911b14', '1f0ddfb2-b06c-4ba7-a951-88a56858b626', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('a9c09911-aaa6-4796-8605-2ea5f6d1faef', '4261c0dd-118b-43ab-8ffb-29c4f4717b1d', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('ad19b648-aedc-4275-bbc9-5cf2ca7353de', '09a776df-244e-4355-8ecd-cc59125b0c53', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('ae201762-212a-4bd3-9151-67a7c2363ace', 'f18035db-a2f4-4dc2-9dda-8e48ee73b1c0', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('b16bcfdd-1deb-4e78-934b-9d1a7fedb0f7', '4be6fb14-b15a-4de6-a6bb-7998ebf64479', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('b1f8794a-a836-40dd-a53a-75e3c03e04ae', '69536c20-af61-44a8-9d1b-99fab2f54b91', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('b2f4ce56-c399-4e74-bb77-f63f38af78a5', '7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', '4c1aa22b-0d74-4e77-a27b-ca34e43d83d3', 2, 80.00),
('b55ec864-f515-460c-87f4-ee340667e28b', 'a7de96f0-1871-4a1a-bab7-2688b590b47e', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50),
('b769ef1c-881b-4ca3-afd9-0f067e153a03', '7db3bb85-eee8-469f-bd31-2053bc931c21', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('bde0b412-e54b-4b5e-bbe3-aedf686098db', 'fc1406d9-b263-430a-b84d-d17a19d3994c', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('be572da2-eb5b-481b-93ea-022eb72ad46b', 'ac79549a-4918-426d-b011-9c701dcb02ac', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('c09ac2bb-6970-4cba-b588-d11ad7f59a5e', 'cc499edb-fd28-4bb1-8ec3-04717abb5828', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('c0e68608-eb23-41eb-9370-74d90bae8c7a', '8906a01a-5dd6-48b1-a294-f370517ef827', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('c1612c69-5b44-4e64-a901-a3b79d446102', '7db3bb85-eee8-469f-bd31-2053bc931c21', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('c33a23f6-f77a-4457-af5d-98076c30ab92', 'b4ec537e-e906-4f71-ae7f-4a0c59467482', '7ef185c0-0b7d-43fd-ba17-ab7bff771d8e', 2, 4.20),
('c421dad0-b224-430e-9c01-beb0c59290fe', 'd2373e00-d7d0-43b1-98fd-dc49c69e8ebb', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('caf0a355-3f94-444e-b798-649d1fb66dc8', '1f0ddfb2-b06c-4ba7-a951-88a56858b626', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('cd5b2436-bba7-4121-b0df-3909ee0d3a32', '8906a01a-5dd6-48b1-a294-f370517ef827', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('ce32a38b-8ea3-4af4-bdd9-a3e7850b4254', 'a7de96f0-1871-4a1a-bab7-2688b590b47e', '7ef185c0-0b7d-43fd-ba17-ab7bff771d8e', 2, 4.20),
('d8c3de8b-3dd8-490a-b310-a788092c8a27', '383fe2e4-e331-426b-8d3a-2d6cae03accd', '15813cd0-017c-4e40-a2b7-5f2f311c0f70', 2, 3.00),
('dade6a59-761b-46a1-b6a1-81d5d5fcbe3e', 'c8216e03-86fd-449a-863f-f9b69cd8f5fa', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('dcbc0c53-00e7-41bd-9b6e-5f4725319cc2', 'f18035db-a2f4-4dc2-9dda-8e48ee73b1c0', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('dde36ee6-22a5-42d5-9906-80bf23b1d348', '4c9196e0-e7c8-4741-b61a-fda953ee165e', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('e033fd2f-02b3-4838-ac73-43c87102d29b', '06f3521f-5398-461e-a49c-bdb2b63f0bbe', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 1, 32.00),
('e45a4cc1-46e6-467c-91d4-fe6bc7cde87b', '1f0ddfb2-b06c-4ba7-a951-88a56858b626', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('ec005c37-78ce-4a0a-babd-9c2d58058d8e', 'f405aec6-6ae0-41b5-ba05-5f0a1fdb72d3', 'c5464e6d-cf59-4991-af8a-ffc786015cec', 2, 12.50),
('ed3c8b4c-8bb7-4050-bb50-3c73dabbd15c', 'd397762d-955f-4732-84cd-bd5337c9492a', '6f45830e-3ab7-4961-b33e-58759caeb254', 2, 11.00),
('ed91b01e-7f90-4a83-b920-280d19b50092', 'fda40b2f-371f-4979-8a4f-5775fdae62bc', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('ef597671-c3c2-42d2-a4e0-0aa38422b422', '55c887fb-1cbd-4388-bc09-803521f7b6eb', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('efa180a0-41d3-4a02-906f-5f90f11eb427', 'd397762d-955f-4732-84cd-bd5337c9492a', '07241042-e818-4b00-9e5d-93c1e2bbaed9', 2, 24.00),
('f0c1869f-3e21-4e2f-8791-5a2e716daf9a', '4c9196e0-e7c8-4741-b61a-fda953ee165e', '4c1aa22b-0d74-4e77-a27b-ca34e43d83d3', 2, 80.00),
('f11053e9-9d92-4fed-9be6-397c2ea8dbbe', '55c887fb-1cbd-4388-bc09-803521f7b6eb', '352876fb-0471-428b-8973-22e67c005f59', 2, 320.00),
('f21b7d3f-c5a5-46d8-8ecd-ca446808acc3', 'bd667c7f-8c1f-4dec-9a34-c45fd61e5456', '22054f1a-2c23-4eba-8a1e-408e95a08767', 1, 420.00),
('f390ec50-e489-46b7-9cac-311f0018af71', '7c7e6bee-022c-42ef-9a2f-f0cf2f761ad2', 'f683b1b7-8a92-4d99-aeb0-75128a05bf4c', 1, 260.00),
('f4d859ba-e5eb-410e-a1d2-c192ba8f541f', 'b4ec537e-e906-4f71-ae7f-4a0c59467482', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('f58f9ec4-e098-4ca2-84f1-3c9be08867b8', '124ccae8-3165-4055-b80c-9d07b969ce3c', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('f6e96d3e-336e-425f-a198-b668d9d3b845', 'f2c429a9-c354-4945-adb4-e1872e75fc6c', '947fe1c8-10cc-4f63-b28d-8b33cf845e57', 2, 8.50),
('f7b9b93d-0dc0-40d4-9fd6-3bcfc6a66897', 'd05fc3f1-57e7-4759-b78f-41480813356e', '716ea476-d142-458e-afde-b092d2a8098f', 1, 4.25),
('fd3485dd-cf01-4d71-a0bb-bfcfd6e9c043', '09a776df-244e-4355-8ecd-cc59125b0c53', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 1, 9.50),
('fe43f249-73a5-4ee2-828a-4a6ca73ee9dd', 'cc499edb-fd28-4bb1-8ec3-04717abb5828', '2633b983-aeb0-4109-8a7b-11440f13ec28', 1, 3.50),
('fe8c113a-b014-4e05-8ce8-b75b79aa3721', '69536c20-af61-44a8-9d1b-99fab2f54b91', 'd8fa23a0-8c07-448c-878b-01e36202cad7', 1, 5.50);

-- --------------------------------------------------------

--
-- Table structure for table `orderitemmodifier`
--

CREATE TABLE `orderitemmodifier` (
  `id` varchar(36) NOT NULL,
  `orderItemId` varchar(36) NOT NULL,
  `modifierId` varchar(36) NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` varchar(36) NOT NULL,
  `scope` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`id`, `scope`, `description`) VALUES
('0749a1c5-9c59-4107-bd74-e761e56d7f6a', 'po:manage', 'Create purchase orders and coordinate suppliers'),
('0b113d75-3373-431f-80c6-8d04344ff585', 'inventory:write', 'Manage inventory items, batches, and transfers'),
('0cb89b27-c91c-44d3-b80a-ff39cecc70c7', 'menu:pricing', 'Configure menu pricing, discounts, and happy hours'),
('0ea8e5c0-4c3c-4919-b12b-0a9c57c88794', 'finance:read', 'View financial reports, P&L, and VAT'),
('1cc3ef7b-2224-4012-b462-1d7501a6eb46', 'orders:kds', 'View and update kitchen display / order status'),
('207fafd4-0452-4dc8-a523-51110c6094fd', 'po:approve', 'Approve purchases and deliveries'),
('2696cc3e-54a3-42d1-b854-d3514cc6645c', 'loyalty:manage', 'Manage loyalty, coupons, gift cards, and campaigns'),
('2c39bff4-da93-4270-aca4-68fe093b5e77', 'orders:checkout', 'Take orders, billing, payments, and refunds'),
('46ebd5dc-6bd3-41cd-b043-e7ca82601520', 'crm:manage', 'Manage reservations, waitlist, and customer issues'),
('5bf08497-01db-48b2-a987-d6e7795b087e', 'attendance:clock', 'Clock in and out of shifts'),
('63dc4dc3-01f9-4821-a6cb-d62afadd1b07', 'reports:read', 'View operational and sales analytics'),
('695def59-3ee4-4afb-ba6f-65f22266b517', 'catering:manage', 'Manage catering events and production batches'),
('6af71863-edbc-4d75-9e5a-c8ac3fe6d538', 'delivery:manage', 'Assign deliveries, routing, and delivery performance'),
('77c47a85-ce09-4d7b-9c6b-50db899137ba', 'platform:tenants', 'Create, suspend, or delete restaurant tenants'),
('82234ff9-345a-420b-884d-b2c3032291e9', 'waste:approve', 'Approve waste entries'),
('870130dd-d865-45be-8165-f2103f39ca01', 'platform:integrations', 'Configure email, SMS, WhatsApp, and payment gateways'),
('8bb1f664-d130-4c9d-9dff-9b9f037f6586', 'tables:manage', 'Manage floors, tables, and seating layout'),
('8ecb4997-a8e8-475a-8d11-a8ec132339f7', 'attendance:read', 'View attendance, leave, and staffing levels'),
('94b69160-7ec1-4e21-a725-deecc666ca7b', 'menu:read', 'View menu catalogs and recipes'),
('999434a8-d21b-4f58-9b6d-85c25d22b42d', 'staff:manage', 'Manage employees, roles assignment, and onboarding'),
('9c24242c-b149-4ba4-bdc2-df3d46a5d6e0', 'settings:write', 'Configure restaurant profile, hours, branding, and taxes'),
('9c300996-a8d9-4630-8a54-be29980e80db', 'branch:manage', 'Create and update restaurant branches'),
('9e0ca725-85eb-412f-9398-b3178bdbdcc6', 'waste:write', 'Log food and ingredient waste'),
('9f0edc5a-d3a9-459e-964a-5ec94ea0b27b', 'platform:tax', 'Manage global tax settings'),
('bfea9058-10fa-4e9c-bb47-58f5928d3069', 'platform:support', 'Manage support tickets and support-mode access'),
('c11927c7-d0d7-437c-abeb-a088c2ff1e0e', 'inventory:adjust', 'Perform stock adjustments and physical counts'),
('c176d5e9-e471-4a38-b71d-eaf183d074e0', 'platform:announcements', 'Manage system announcements'),
('c9110296-9e23-4207-8389-3ee0a8fd1da7', 'expenses:approve', 'Approve expenses within policy limits'),
('d12e8f5d-2eff-4dcc-a90e-48f00bbcc2b6', 'platform:analytics', 'View platform-wide analytics and system health'),
('d4d230b2-72ab-4e03-a819-659fee43a282', 'platform:api_keys', 'Manage platform API keys'),
('dcfb19a2-df83-4c10-a808-cdd48db5f949', 'inventory:approve', 'Approve inventory adjustments'),
('e0712558-e00e-4448-90ca-1c8d560bbbba', 'menu:write', 'Create/update menu items, categories, and recipes'),
('e19ef4ab-51df-4b77-95d4-3009918728fd', 'finance:write', 'Manage expenses, invoices, and reconciliations'),
('e65aeeab-4a47-4572-9f7e-c637d40c87ff', 'platform:features', 'Manage feature access by subscription plan'),
('e6d9d43e-2e5e-4449-8633-190e01008315', 'platform:billing', 'Manage subscription plans, billing, and invoices'),
('eae2faa5-b518-47ef-a5ae-6c770b5b21ec', 'audit:read', 'View audit logs and compliance exports (read-only)'),
('f96cdf4d-cb18-4bb3-bfcf-026f51f3f124', 'platform:audit', 'View platform audit logs and backup policies');

-- --------------------------------------------------------

--
-- Table structure for table `planfeatureflag`
--

CREATE TABLE `planfeatureflag` (
  `id` varchar(36) NOT NULL,
  `planTier` enum('STARTER','GROWTH','ENTERPRISE') NOT NULL,
  `featureKey` varchar(100) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `planfeatureflag`
--

INSERT INTO `planfeatureflag` (`id`, `planTier`, `featureKey`, `enabled`) VALUES
('0a80dec4-484d-416e-b133-5d9d942210b9', 'GROWTH', 'inventory', 1),
('11aad62b-c234-488a-a7d0-082aac2c3bba', 'GROWTH', 'advanced_reports', 1),
('172b63c3-803c-48ec-ad94-c3351452dbfa', 'ENTERPRISE', 'catering', 1),
('1a913f45-d7d3-4cb2-881a-0ff863667b9d', 'STARTER', 'inventory', 1),
('1eaa3a51-21e3-4aa5-bd23-9a036d030582', 'ENTERPRISE', 'loyalty', 1),
('273a3480-bf6e-495c-9c5e-b208eb25fa12', 'STARTER', 'kds', 1),
('2940b76d-094f-4ddb-af86-f97fbfdcd5e9', 'ENTERPRISE', 'pos', 1),
('368d641c-19e5-4b07-be73-6c868d1938b0', 'ENTERPRISE', 'kds', 1),
('36ee715a-16e3-4db7-907a-cf472aa9c23f', 'ENTERPRISE', 'advanced_reports', 1),
('380a5136-53b5-44cd-bb6d-eccfbb37b674', 'ENTERPRISE', 'delivery', 1),
('62eccfa7-8a98-4549-92d8-71cb0e5b7805', 'GROWTH', 'catering', 1),
('68cd1561-89c7-4238-aa13-e35aac37a495', 'STARTER', 'catering', 0),
('789544b3-9267-4cab-b2de-f1bca686a602', 'GROWTH', 'multi_branch', 1),
('79dbaeaa-ac5c-4466-b07c-e2906953caeb', 'ENTERPRISE', 'inventory', 1),
('818e17d9-1e3d-4058-8534-30bd0e7fa44d', 'ENTERPRISE', 'api_access', 1),
('84504095-c885-4421-a355-41fc31f3c26f', 'GROWTH', 'loyalty', 1),
('9b4b95d7-5426-4dd1-9b87-cceba9a4cdf2', 'GROWTH', 'kds', 1),
('c576a1d0-5ae7-443b-90d6-e97b6734a3f4', 'STARTER', 'api_access', 0),
('c5fada4f-54aa-411f-87c3-7c2d538011fa', 'GROWTH', 'pos', 1),
('c73f60eb-1bdf-4aee-afa0-43a5991f6f58', 'STARTER', 'delivery', 0),
('cdd47f5c-4a49-495c-99e7-77073af2700d', 'STARTER', 'multi_branch', 0),
('d181f958-5f5f-4dc5-8b93-7e48d5f7f674', 'STARTER', 'advanced_reports', 0),
('d6a07b1c-fac4-433b-8c9e-9c68da26a576', 'GROWTH', 'delivery', 1),
('e0721bb2-5865-40a9-bf4f-541f6c8cd1bc', 'STARTER', 'loyalty', 1),
('e7e4f386-e2c3-4545-b7a7-fd731274b49b', 'GROWTH', 'api_access', 0),
('e9126899-9818-4766-ab48-705f884a7281', 'STARTER', 'pos', 1),
('ff900fae-de98-451a-81e0-f55f192385f4', 'ENTERPRISE', 'multi_branch', 1);

-- --------------------------------------------------------

--
-- Table structure for table `platformbranding`
--

CREATE TABLE `platformbranding` (
  `id` varchar(36) NOT NULL,
  `appName` varchar(100) NOT NULL DEFAULT 'Restaurant Ops',
  `logo` text DEFAULT NULL,
  `favicon` text DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platformbranding`
--

INSERT INTO `platformbranding` (`id`, `appName`, `logo`, `favicon`, `updatedAt`) VALUES
('92611d9c-9f1f-4cfe-b523-0b662a556c44', 'Restaurant Ops', NULL, NULL, '2026-07-13 06:16:33.468');

-- --------------------------------------------------------

--
-- Table structure for table `platformintegration`
--

CREATE TABLE `platformintegration` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `channel` enum('EMAIL','SMS','WHATSAPP','PAYMENT') NOT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platformintegration`
--

INSERT INTO `platformintegration` (`id`, `name`, `channel`, `config`, `isActive`, `updatedAt`) VALUES
('01fb05fa-fb1c-4003-886e-92643f0d86f4', 'SMS Gateway', 'SMS', '{\"provider\":\"twilio\",\"senderId\":\"TASTYC\"}', 1, '2026-07-13 05:17:47.377'),
('0b3ec58c-70c9-437e-a094-bd0360502534', 'Card Payments', 'PAYMENT', '{\"provider\":\"stripe\",\"mode\":\"test\"}', 1, '2026-07-13 05:17:47.377'),
('7f33a30e-6a4a-4767-afde-39e94cd9ce19', 'Transactional Email (SMTP)', 'EMAIL', '{\"provider\":\"smtp\",\"from\":\"noreply@tastyc.com\",\"region\":\"us-east-1\"}', 1, '2026-07-13 05:17:47.377'),
('ef807eab-f182-4961-8f76-69a694a183f1', 'WhatsApp Business', 'WHATSAPP', '{\"provider\":\"meta\",\"status\":\"pending_verification\"}', 0, '2026-07-13 05:17:47.377');

-- --------------------------------------------------------

--
-- Table structure for table `productionbatch`
--

CREATE TABLE `productionbatch` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `recipeId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `batchQty` decimal(10,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productionbatch`
--

INSERT INTO `productionbatch` (`id`, `tenantId`, `branchId`, `recipeId`, `name`, `batchQty`, `status`, `createdAt`) VALUES
('57e3a3ed-4f4d-4956-8d6d-e46f73fb0543', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', 'aea1e7e4-7ab5-4697-ac2f-996d03212500', 'Acai Smoothie Bowl — prep batch', 20.00, 'IN_PROGRESS', '2026-07-13 06:46:21.684'),
('665acb9a-bba8-4540-ab9a-72e2903044fd', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '828089f4-284b-4ca2-8ec2-3afb6e309daa', 'Grilled Salmon — prep batch', 20.00, 'IN_PROGRESS', '2026-07-13 06:46:21.158'),
('9aa07059-bca1-4695-b088-07de7cb33d68', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '716ea476-d142-458e-afde-b092d2a8098f', 'Almond Croissant — prep batch', 20.00, 'IN_PROGRESS', '2026-07-13 06:46:20.788'),
('fcdcd66a-e6d4-4e1b-8435-ff1a4b936717', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '22054f1a-2c23-4eba-8a1e-408e95a08767', 'Butter Chicken — prep batch', 20.00, 'IN_PROGRESS', '2026-07-13 06:46:20.998');

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorder`
--

CREATE TABLE `purchaseorder` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `poNumber` varchar(100) NOT NULL,
  `supplierId` varchar(36) NOT NULL,
  `status` enum('DRAFT','PENDING','ACCEPTED','SHIPPED','DELIVERED','CANCELLED','PAID','RETURNED') NOT NULL DEFAULT 'DRAFT',
  `totalAmount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `invoiceUrl` text DEFAULT NULL,
  `branchId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorderitem`
--

CREATE TABLE `purchaseorderitem` (
  `id` varchar(36) NOT NULL,
  `purchaseOrderId` varchar(36) NOT NULL,
  `ingredientId` varchar(36) NOT NULL,
  `orderedQty` decimal(12,3) NOT NULL,
  `receivedQty` decimal(12,3) NOT NULL DEFAULT 0.000,
  `unitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recipe`
--

CREATE TABLE `recipe` (
  `id` varchar(36) NOT NULL,
  `menuItemId` varchar(36) NOT NULL,
  `ingredientId` varchar(36) NOT NULL,
  `quantity` decimal(12,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recipe`
--

INSERT INTO `recipe` (`id`, `menuItemId`, `ingredientId`, `quantity`) VALUES
('426da328-407b-4ed2-88d5-5e674b385fb9', 'f3afdb8c-ff6b-4cea-9402-9b6c24e26c5e', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 0.018),
('7083c304-cce3-4772-9681-e8cb8ee487da', 'dd5ffcce-7099-4ea8-ba5f-359b91b96bd9', '0d3fd69a-7333-4711-9f36-3f670666df17', 0.015),
('79e220bd-59cc-4db5-9c7e-a22bdb1fc056', '0b8cfada-763a-45f2-accc-440c0a3ebe9e', '23809928-84cc-454e-a5f0-bdf23ef3f900', 0.020),
('a88e8fec-96db-4c84-861b-c5504ed84044', '73f3f62c-d7bb-4d14-8a8d-23af11f15b77', '15fc92b3-5361-4f79-82e5-5ef3fc4290a5', 0.200),
('a994edaa-f14f-47bd-b424-ee9b7adce2a8', '73f3f62c-d7bb-4d14-8a8d-23af11f15b77', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 0.018),
('b4eb2dd9-cfcd-47d9-aa36-80635f04974d', '0b8cfada-763a-45f2-accc-440c0a3ebe9e', '15fc92b3-5361-4f79-82e5-5ef3fc4290a5', 0.250),
('ceefddb7-cccf-4233-8eb0-c9ef205aacc8', 'cdcbdd0e-4313-43e2-bdec-43c010ae8407', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 0.030),
('de511d3f-7909-449e-8d6d-7532a2aba580', '0b8cfada-763a-45f2-accc-440c0a3ebe9e', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 0.018);

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

CREATE TABLE `reservation` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `customerName` varchar(150) NOT NULL,
  `customerEmail` varchar(150) NOT NULL,
  `customerPhone` varchar(50) NOT NULL,
  `partySize` int(11) NOT NULL DEFAULT 2,
  `reservationTime` datetime(3) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `tableId` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservation`
--

INSERT INTO `reservation` (`id`, `tenantId`, `customerName`, `customerEmail`, `customerPhone`, `partySize`, `reservationTime`, `status`, `tableId`, `notes`, `createdAt`) VALUES
('00187804-3582-48ab-9428-fab657ae985d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Priya Sharma', 'priya@example.com', '+15550101', 4, '2026-07-14 06:46:21.078', 'CONFIRMED', 'b7de425e-d8b9-4588-8d09-b57ebae34559', 'Window seat preferred', '2026-07-13 06:46:21.085'),
('14b0830f-6bc4-4b09-9d9f-220688d2dea5', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Priya Sharma', 'priya@example.com', '+15550101', 4, '2026-07-14 06:46:20.646', 'CONFIRMED', '5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', 'Window seat preferred', '2026-07-13 06:46:20.652'),
('21449ae2-6cb0-4314-a25f-4ad7f46d57b9', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Priya Sharma', 'priya@example.com', '+15550101', 4, '2026-07-14 06:46:20.905', 'CONFIRMED', '0e5935a4-33c1-4000-86eb-9ff3dbf71c43', 'Window seat preferred', '2026-07-13 06:46:20.912'),
('34d7d461-e311-43e4-b5ad-cd9dd93a2fa7', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Marcus Chen', 'marcus@example.com', '+15550102', 2, '2026-07-15 06:46:21.510', 'PENDING', NULL, 'Anniversary', '2026-07-13 06:46:21.517'),
('ac5902d2-a101-4699-adb6-948e61afad92', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Priya Sharma', 'priya@example.com', '+15550101', 4, '2026-07-14 06:46:21.510', 'CONFIRMED', 'a26497e6-50ce-4f03-a819-bb37b3dc6a18', 'Window seat preferred', '2026-07-13 06:46:21.517'),
('b5a1233f-b68d-4f62-8168-6291e97f7ec1', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Marcus Chen', 'marcus@example.com', '+15550102', 2, '2026-07-15 06:46:20.646', 'PENDING', NULL, 'Anniversary', '2026-07-13 06:46:20.652'),
('c2435486-7127-4aea-a265-469257a084b7', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Marcus Chen', 'marcus@example.com', '+15550102', 2, '2026-07-15 06:46:20.905', 'PENDING', NULL, 'Anniversary', '2026-07-13 06:46:20.912'),
('d5fea27c-87c4-4ab1-8f80-fb9fd2a53a2c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Marcus Chen', 'marcus@example.com', '+15550102', 2, '2026-07-15 06:46:21.078', 'PENDING', NULL, 'Anniversary', '2026-07-13 06:46:21.085');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `isSystem` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `tenantId`, `name`, `isSystem`, `createdAt`, `deletedAt`) VALUES
('03d329aa-adb0-4c1d-873a-3e88d1877acd', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'SYSTEM_AUDITOR', 1, '2026-07-13 05:23:33.672', NULL),
('054ae9da-3c63-45e7-ba2e-4d4ae6666448', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'KITCHEN_STAFF', 1, '2026-07-10 11:21:29.513', NULL),
('0788fcd6-39fd-4a31-9f10-ad3eedcc6e0a', '1986a50c-b166-4771-87df-3d37f61d66a2', 'DELIVERY_STAFF', 1, '2026-07-13 05:23:32.860', NULL),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'AREA_MANAGER', 1, '2026-07-13 05:23:33.381', NULL),
('13346a67-56ae-48b0-8c27-65940b4c5f47', '1986a50c-b166-4771-87df-3d37f61d66a2', 'HR_MANAGER', 1, '2026-07-13 05:23:32.891', NULL),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'OWNER', 1, '2026-07-13 05:23:33.133', NULL),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '1986a50c-b166-4771-87df-3d37f61d66a2', 'OWNER', 1, '2026-07-13 05:23:32.501', NULL),
('196639c5-126c-4f09-8329-f96887a0d58c', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'CASHIER', 1, '2026-07-13 05:23:33.431', NULL),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '1986a50c-b166-4771-87df-3d37f61d66a2', 'AREA_MANAGER', 1, '2026-07-13 05:23:32.516', NULL),
('1af0052d-2f08-43ab-9059-a3187d9f48bf', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'DELIVERY_STAFF', 1, '2026-07-13 05:23:33.216', NULL),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'KITCHEN_MANAGER', 1, '2026-07-13 05:23:33.154', NULL),
('20e6fa8e-705e-4feb-8355-89003238b29e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'HR_MANAGER', 1, '2026-07-10 11:21:29.548', NULL),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '1986a50c-b166-4771-87df-3d37f61d66a2', 'PURCHASE_MANAGER', 1, '2026-07-13 05:23:32.821', NULL),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'SYSTEM_AUDITOR', 1, '2026-07-10 11:21:29.567', NULL),
('315be33d-dabe-4079-81b2-facfcc496a78', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'WAITER', 1, '2026-07-10 11:21:29.573', NULL),
('3974c996-e976-49ce-93f7-d17221406bf5', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'SOUS_CHEF', 1, '2026-07-10 11:21:29.507', NULL),
('3b905b43-e9a4-418e-babb-4459b9198023', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'WAITER', 1, '2026-07-13 05:23:33.185', NULL),
('3edd11f7-b8df-40bb-9a51-a0aedacd3848', '1986a50c-b166-4771-87df-3d37f61d66a2', 'CUSTOMER', 1, '2026-07-13 05:23:32.925', NULL),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'PURCHASE_MANAGER', 1, '2026-07-13 05:23:33.201', NULL),
('425bc8e8-d7a9-4365-a1cb-0984e5496592', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'SOUS_CHEF', 1, '2026-07-13 05:23:33.412', NULL),
('47fd8aa0-2e05-4f9f-a8b0-ff66e9351c6b', '1986a50c-b166-4771-87df-3d37f61d66a2', 'SOUS_CHEF', 1, '2026-07-13 05:23:32.734', NULL),
('4aba7882-74f7-4271-bb18-c35ee1746a67', '1986a50c-b166-4771-87df-3d37f61d66a2', 'KITCHEN_STAFF', 1, '2026-07-13 05:23:32.785', NULL),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '1986a50c-b166-4771-87df-3d37f61d66a2', 'BRANCH_MANAGER', 1, '2026-07-13 05:23:32.531', NULL),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '1986a50c-b166-4771-87df-3d37f61d66a2', 'CASHIER', 1, '2026-07-13 05:23:32.804', NULL),
('5095bc5c-3377-4f21-b1d2-894b12c43996', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'CASHIER', 1, '2026-07-10 11:21:29.519', NULL),
('534c9e6e-b3d8-4c25-81e6-680f27dc95ee', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'CUSTOMER', 1, '2026-07-10 11:21:29.578', NULL),
('5365db97-342a-4018-a5db-5d971a927286', '1986a50c-b166-4771-87df-3d37f61d66a2', 'INVENTORY_MANAGER', 1, '2026-07-13 05:23:32.813', NULL),
('5f39ae38-a43d-4035-9f2c-767749672b35', '1986a50c-b166-4771-87df-3d37f61d66a2', 'MARKETING_MANAGER', 1, '2026-07-13 05:23:32.910', NULL),
('6350f114-0d36-4365-b73a-ebc43d3581f4', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'KITCHEN_STAFF', 1, '2026-07-13 05:23:33.418', NULL),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', NULL, 'SUPER_ADMIN', 1, '2026-07-13 05:17:47.004', NULL),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '1986a50c-b166-4771-87df-3d37f61d66a2', 'WAITER', 1, '2026-07-13 05:23:32.796', NULL),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'WAITER', 1, '2026-07-13 05:23:33.423', NULL),
('6f15de6e-126a-4555-ab44-9f70b0466c37', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'DELIVERY_STAFF', 1, '2026-07-13 05:23:33.452', NULL),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '1986a50c-b166-4771-87df-3d37f61d66a2', 'KITCHEN_MANAGER', 1, '2026-07-13 05:23:32.547', NULL),
('74f0a834-6029-4a08-972a-d9a09313f762', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'DELIVERY_MANAGER', 1, '2026-07-13 05:23:33.206', NULL),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'ACCOUNTANT', 1, '2026-07-13 05:23:33.227', NULL),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'BRANCH_MANAGER', 1, '2026-07-13 05:23:33.148', NULL),
('8de33801-991c-47c9-b64a-7e910222264f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'KITCHEN_STAFF', 1, '2026-07-13 05:23:33.178', NULL),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'CHEF', 1, '2026-07-13 05:23:33.163', NULL),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'INVENTORY_MANAGER', 1, '2026-07-10 11:21:29.525', NULL),
('9454f32b-f327-4bb2-a24b-607909092a5e', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'DELIVERY_MANAGER', 1, '2026-07-13 05:23:33.448', NULL),
('963c85a5-8a22-45ca-aa97-c056235906ae', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'DELIVERY_STAFF', 1, '2026-07-10 11:21:29.542', NULL),
('9f1772c8-92a6-493b-881d-54f7dc9a35dc', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'MARKETING_MANAGER', 1, '2026-07-13 05:23:33.232', NULL),
('9f722ab8-5f4e-487a-9560-25168c655ccf', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'SOUS_CHEF', 1, '2026-07-13 05:23:33.170', NULL),
('a0b10322-0bcd-404c-b600-a2a2bf626a9c', '1986a50c-b166-4771-87df-3d37f61d66a2', 'DELIVERY_MANAGER', 1, '2026-07-13 05:23:32.828', NULL),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'KITCHEN_MANAGER', 1, '2026-07-10 11:21:29.500', NULL),
('a4021774-d0aa-4f1a-8526-802d4698075f', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'INVENTORY_MANAGER', 1, '2026-07-13 05:23:33.436', NULL),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'OWNER', 1, '2026-07-10 11:21:29.489', NULL),
('a7ac56cd-f79c-4627-bb60-81b63ff40c6f', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'HR_MANAGER', 1, '2026-07-13 05:23:33.460', NULL),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'INVENTORY_MANAGER', 1, '2026-07-13 05:23:33.197', NULL),
('ad55a614-5052-4292-996b-97be0ec1c882', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'CASHIER', 1, '2026-07-13 05:23:33.190', NULL),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'CHEF', 1, '2026-07-13 05:23:33.405', NULL),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', '1986a50c-b166-4771-87df-3d37f61d66a2', 'SYSTEM_AUDITOR', 1, '2026-07-13 05:23:32.917', NULL),
('bc5627b8-868f-4262-a050-bcf355fa35d0', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'AREA_MANAGER', 1, '2026-07-13 04:46:25.809', NULL),
('bcad366f-3d2e-45eb-88f8-b13c591d8597', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'MARKETING_MANAGER', 1, '2026-07-10 11:21:29.561', NULL),
('c0897f45-d46e-4567-a860-36bff16f107e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'SUPER_ADMIN', 1, '2026-07-13 04:46:25.786', '2026-07-13 05:17:47.157'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'ACCOUNTANT', 1, '2026-07-10 11:21:29.553', NULL),
('c487df00-820d-44f9-9f30-3b743c51e944', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'ACCOUNTANT', 1, '2026-07-13 05:23:33.466', NULL),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'AREA_MANAGER', 1, '2026-07-13 05:23:33.140', NULL),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'OWNER', 1, '2026-07-13 05:23:33.374', NULL),
('d56655b9-b48e-48b8-a9b3-8615d76b18d5', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'CUSTOMER', 1, '2026-07-13 05:23:33.721', NULL),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'BRANCH_MANAGER', 1, '2026-07-13 05:23:33.387', NULL),
('d9264568-4723-4876-a015-a262e0c85841', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'DELIVERY_MANAGER', 1, '2026-07-10 11:21:29.536', NULL),
('db27d847-d056-4a56-be9a-136918deb308', '1986a50c-b166-4771-87df-3d37f61d66a2', 'CHEF', 1, '2026-07-13 05:23:32.629', NULL),
('dcbd3384-35e3-43fb-b229-3c273ba895f3', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'HR_MANAGER', 1, '2026-07-13 05:23:33.220', NULL),
('deb35ca8-3169-4866-8327-99781855428a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'CUSTOMER', 1, '2026-07-13 05:23:33.244', NULL),
('e501b764-2d09-4f61-b6e2-e66226df7416', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'CHEF', 1, '2026-07-10 11:21:29.503', NULL),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'PURCHASE_MANAGER', 1, '2026-07-10 11:21:29.530', NULL),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'KITCHEN_MANAGER', 1, '2026-07-13 05:23:33.400', NULL),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'BRANCH_MANAGER', 1, '2026-07-10 11:21:29.495', NULL),
('ea6231b9-d475-4f11-a249-02be2fef5072', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'SYSTEM_AUDITOR', 1, '2026-07-13 05:23:33.237', NULL),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', '1986a50c-b166-4771-87df-3d37f61d66a2', 'ACCOUNTANT', 1, '2026-07-13 05:23:32.901', NULL),
('f4283a3d-b2f2-491e-a729-e1125ff111fb', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'MARKETING_MANAGER', 1, '2026-07-13 05:23:33.581', NULL),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'PURCHASE_MANAGER', 1, '2026-07-13 05:23:33.442', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rolepermission`
--

CREATE TABLE `rolepermission` (
  `roleId` varchar(36) NOT NULL,
  `permissionId` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rolepermission`
--

INSERT INTO `rolepermission` (`roleId`, `permissionId`) VALUES
('03d329aa-adb0-4c1d-873a-3e88d1877acd', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('03d329aa-adb0-4c1d-873a-3e88d1877acd', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('03d329aa-adb0-4c1d-873a-3e88d1877acd', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('03d329aa-adb0-4c1d-873a-3e88d1877acd', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('03d329aa-adb0-4c1d-873a-3e88d1877acd', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('054ae9da-3c63-45e7-ba2e-4d4ae6666448', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('054ae9da-3c63-45e7-ba2e-4d4ae6666448', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('054ae9da-3c63-45e7-ba2e-4d4ae6666448', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('0788fcd6-39fd-4a31-9f10-ad3eedcc6e0a', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('0788fcd6-39fd-4a31-9f10-ad3eedcc6e0a', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('0788fcd6-39fd-4a31-9f10-ad3eedcc6e0a', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '0b113d75-3373-431f-80c6-8d04344ff585'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '82234ff9-345a-420b-884d-b2c3032291e9'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '9c300996-a8d9-4630-8a54-be29980e80db'),
('0d9be862-70d4-49a9-be4f-383c37ae3adc', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('13346a67-56ae-48b0-8c27-65940b4c5f47', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('13346a67-56ae-48b0-8c27-65940b4c5f47', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('13346a67-56ae-48b0-8c27-65940b4c5f47', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('13346a67-56ae-48b0-8c27-65940b4c5f47', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '0b113d75-3373-431f-80c6-8d04344ff585'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '82234ff9-345a-420b-884d-b2c3032291e9'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '9c300996-a8d9-4630-8a54-be29980e80db'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('141c64cc-457a-44c0-a7b4-92ccf4e5180d', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '0b113d75-3373-431f-80c6-8d04344ff585'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '82234ff9-345a-420b-884d-b2c3032291e9'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '9c300996-a8d9-4630-8a54-be29980e80db'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('15aa808c-6230-4ee8-87cc-7ff6217f5922', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('196639c5-126c-4f09-8329-f96887a0d58c', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('196639c5-126c-4f09-8329-f96887a0d58c', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('196639c5-126c-4f09-8329-f96887a0d58c', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('196639c5-126c-4f09-8329-f96887a0d58c', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('196639c5-126c-4f09-8329-f96887a0d58c', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('196639c5-126c-4f09-8329-f96887a0d58c', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '0b113d75-3373-431f-80c6-8d04344ff585'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '82234ff9-345a-420b-884d-b2c3032291e9'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '9c300996-a8d9-4630-8a54-be29980e80db'),
('19ccd81a-75f9-4b69-a500-b3029d98c3cb', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('1af0052d-2f08-43ab-9059-a3187d9f48bf', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('1af0052d-2f08-43ab-9059-a3187d9f48bf', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('1af0052d-2f08-43ab-9059-a3187d9f48bf', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '0b113d75-3373-431f-80c6-8d04344ff585'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '82234ff9-345a-420b-884d-b2c3032291e9'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('1e9893df-c81d-480d-a678-87f2c7d94ef2', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('20e6fa8e-705e-4feb-8355-89003238b29e', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('20e6fa8e-705e-4feb-8355-89003238b29e', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('20e6fa8e-705e-4feb-8355-89003238b29e', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('20e6fa8e-705e-4feb-8355-89003238b29e', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '0b113d75-3373-431f-80c6-8d04344ff585'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('227c4e1c-5127-4fd0-9f75-eece6aa24f52', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('2a6a0c57-e3b7-4b0a-b131-c08bf655935e', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('315be33d-dabe-4079-81b2-facfcc496a78', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('315be33d-dabe-4079-81b2-facfcc496a78', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('315be33d-dabe-4079-81b2-facfcc496a78', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('315be33d-dabe-4079-81b2-facfcc496a78', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('315be33d-dabe-4079-81b2-facfcc496a78', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('315be33d-dabe-4079-81b2-facfcc496a78', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('3974c996-e976-49ce-93f7-d17221406bf5', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('3974c996-e976-49ce-93f7-d17221406bf5', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('3974c996-e976-49ce-93f7-d17221406bf5', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('3974c996-e976-49ce-93f7-d17221406bf5', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('3b905b43-e9a4-418e-babb-4459b9198023', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('3b905b43-e9a4-418e-babb-4459b9198023', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('3b905b43-e9a4-418e-babb-4459b9198023', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('3b905b43-e9a4-418e-babb-4459b9198023', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('3b905b43-e9a4-418e-babb-4459b9198023', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('3b905b43-e9a4-418e-babb-4459b9198023', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('3edd11f7-b8df-40bb-9a51-a0aedacd3848', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('3edd11f7-b8df-40bb-9a51-a0aedacd3848', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('3edd11f7-b8df-40bb-9a51-a0aedacd3848', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('3edd11f7-b8df-40bb-9a51-a0aedacd3848', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '0b113d75-3373-431f-80c6-8d04344ff585'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('3fa0e6fe-790b-4c65-b2f8-65b0b4c2b81c', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('425bc8e8-d7a9-4365-a1cb-0984e5496592', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('425bc8e8-d7a9-4365-a1cb-0984e5496592', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('425bc8e8-d7a9-4365-a1cb-0984e5496592', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('425bc8e8-d7a9-4365-a1cb-0984e5496592', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('47fd8aa0-2e05-4f9f-a8b0-ff66e9351c6b', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('47fd8aa0-2e05-4f9f-a8b0-ff66e9351c6b', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('47fd8aa0-2e05-4f9f-a8b0-ff66e9351c6b', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('47fd8aa0-2e05-4f9f-a8b0-ff66e9351c6b', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('4aba7882-74f7-4271-bb18-c35ee1746a67', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('4aba7882-74f7-4271-bb18-c35ee1746a67', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('4aba7882-74f7-4271-bb18-c35ee1746a67', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '0b113d75-3373-431f-80c6-8d04344ff585'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '82234ff9-345a-420b-884d-b2c3032291e9'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '9c300996-a8d9-4630-8a54-be29980e80db'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('4d20e898-ce1e-4ae7-9df3-baebed833a7d', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('5095bc5c-3377-4f21-b1d2-894b12c43996', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('534c9e6e-b3d8-4c25-81e6-680f27dc95ee', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('534c9e6e-b3d8-4c25-81e6-680f27dc95ee', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('534c9e6e-b3d8-4c25-81e6-680f27dc95ee', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('534c9e6e-b3d8-4c25-81e6-680f27dc95ee', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('5365db97-342a-4018-a5db-5d971a927286', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('5365db97-342a-4018-a5db-5d971a927286', '0b113d75-3373-431f-80c6-8d04344ff585'),
('5365db97-342a-4018-a5db-5d971a927286', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('5365db97-342a-4018-a5db-5d971a927286', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('5365db97-342a-4018-a5db-5d971a927286', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('5365db97-342a-4018-a5db-5d971a927286', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('5365db97-342a-4018-a5db-5d971a927286', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('5365db97-342a-4018-a5db-5d971a927286', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('5f39ae38-a43d-4035-9f2c-767749672b35', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('5f39ae38-a43d-4035-9f2c-767749672b35', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('5f39ae38-a43d-4035-9f2c-767749672b35', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('5f39ae38-a43d-4035-9f2c-767749672b35', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('6350f114-0d36-4365-b73a-ebc43d3581f4', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('6350f114-0d36-4365-b73a-ebc43d3581f4', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('6350f114-0d36-4365-b73a-ebc43d3581f4', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '77c47a85-ce09-4d7b-9c6b-50db899137ba'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '870130dd-d865-45be-8165-f2103f39ca01'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '9c300996-a8d9-4630-8a54-be29980e80db'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', '9f0edc5a-d3a9-459e-964a-5ec94ea0b27b'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'bfea9058-10fa-4e9c-bb47-58f5928d3069'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'c176d5e9-e471-4a38-b71d-eaf183d074e0'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'd12e8f5d-2eff-4dcc-a90e-48f00bbcc2b6'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'd4d230b2-72ab-4e03-a819-659fee43a282'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'e65aeeab-4a47-4572-9f7e-c637d40c87ff'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'e6d9d43e-2e5e-4449-8633-190e01008315'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('65dd1ee4-3cbe-449a-824a-24e62e34d81f', 'f96cdf4d-cb18-4bb3-bfcf-026f51f3f124'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('67df9ae2-1e25-4d09-af96-e2de45dd95fc', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('6c7b12f0-b8d7-4204-8bb5-fa8dce3a6ff6', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('6f15de6e-126a-4555-ab44-9f70b0466c37', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('6f15de6e-126a-4555-ab44-9f70b0466c37', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('6f15de6e-126a-4555-ab44-9f70b0466c37', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '0b113d75-3373-431f-80c6-8d04344ff585'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '82234ff9-345a-420b-884d-b2c3032291e9'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('729ed94e-b464-4d8c-8a53-81e6a543a33f', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('74f0a834-6029-4a08-972a-d9a09313f762', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('74f0a834-6029-4a08-972a-d9a09313f762', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('74f0a834-6029-4a08-972a-d9a09313f762', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('74f0a834-6029-4a08-972a-d9a09313f762', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('7c3e230e-1c14-413f-ae7e-dd04303cdf1f', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '0b113d75-3373-431f-80c6-8d04344ff585'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '82234ff9-345a-420b-884d-b2c3032291e9'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '9c300996-a8d9-4630-8a54-be29980e80db'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('89db28a2-21d5-4491-a0e5-d0be1d8836e1', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('8de33801-991c-47c9-b64a-7e910222264f', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('8de33801-991c-47c9-b64a-7e910222264f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('8de33801-991c-47c9-b64a-7e910222264f', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('921f4eaa-7d54-4487-b5cb-8400a3b7ad76', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '0b113d75-3373-431f-80c6-8d04344ff585'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('9454f32b-f327-4bb2-a24b-607909092a5e', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('9454f32b-f327-4bb2-a24b-607909092a5e', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('9454f32b-f327-4bb2-a24b-607909092a5e', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('9454f32b-f327-4bb2-a24b-607909092a5e', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('963c85a5-8a22-45ca-aa97-c056235906ae', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('963c85a5-8a22-45ca-aa97-c056235906ae', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('963c85a5-8a22-45ca-aa97-c056235906ae', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('9f1772c8-92a6-493b-881d-54f7dc9a35dc', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('9f1772c8-92a6-493b-881d-54f7dc9a35dc', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('9f1772c8-92a6-493b-881d-54f7dc9a35dc', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('9f1772c8-92a6-493b-881d-54f7dc9a35dc', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('9f722ab8-5f4e-487a-9560-25168c655ccf', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('9f722ab8-5f4e-487a-9560-25168c655ccf', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('9f722ab8-5f4e-487a-9560-25168c655ccf', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('9f722ab8-5f4e-487a-9560-25168c655ccf', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('a0b10322-0bcd-404c-b600-a2a2bf626a9c', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('a0b10322-0bcd-404c-b600-a2a2bf626a9c', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('a0b10322-0bcd-404c-b600-a2a2bf626a9c', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('a0b10322-0bcd-404c-b600-a2a2bf626a9c', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '0b113d75-3373-431f-80c6-8d04344ff585'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '82234ff9-345a-420b-884d-b2c3032291e9'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('a30a9796-3eda-4e90-b14c-4ebb313388b2', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '0b113d75-3373-431f-80c6-8d04344ff585'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('a4021774-d0aa-4f1a-8526-802d4698075f', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('a4021774-d0aa-4f1a-8526-802d4698075f', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('a4021774-d0aa-4f1a-8526-802d4698075f', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '0b113d75-3373-431f-80c6-8d04344ff585'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '82234ff9-345a-420b-884d-b2c3032291e9'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '9c300996-a8d9-4630-8a54-be29980e80db'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('a7ac56cd-f79c-4627-bb60-81b63ff40c6f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('a7ac56cd-f79c-4627-bb60-81b63ff40c6f', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('a7ac56cd-f79c-4627-bb60-81b63ff40c6f', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('a7ac56cd-f79c-4627-bb60-81b63ff40c6f', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '0b113d75-3373-431f-80c6-8d04344ff585'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('abd2e6d3-c1b4-47aa-a781-795060bd5164', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('ad55a614-5052-4292-996b-97be0ec1c882', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('ad55a614-5052-4292-996b-97be0ec1c882', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('ad55a614-5052-4292-996b-97be0ec1c882', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('ad55a614-5052-4292-996b-97be0ec1c882', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('ad55a614-5052-4292-996b-97be0ec1c882', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('ad55a614-5052-4292-996b-97be0ec1c882', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('b8190cbd-da93-40ef-9d36-ee770fb76f9b', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('b928fc57-33c9-4a0c-8cf6-6719c79e99a8', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '0b113d75-3373-431f-80c6-8d04344ff585'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '82234ff9-345a-420b-884d-b2c3032291e9'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '9c300996-a8d9-4630-8a54-be29980e80db'),
('bc5627b8-868f-4262-a050-bcf355fa35d0', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('bcad366f-3d2e-45eb-88f8-b13c591d8597', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('bcad366f-3d2e-45eb-88f8-b13c591d8597', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('bcad366f-3d2e-45eb-88f8-b13c591d8597', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('bcad366f-3d2e-45eb-88f8-b13c591d8597', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('c0897f45-d46e-4567-a860-36bff16f107e', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('c0897f45-d46e-4567-a860-36bff16f107e', '77c47a85-ce09-4d7b-9c6b-50db899137ba'),
('c0897f45-d46e-4567-a860-36bff16f107e', '870130dd-d865-45be-8165-f2103f39ca01'),
('c0897f45-d46e-4567-a860-36bff16f107e', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('c0897f45-d46e-4567-a860-36bff16f107e', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('c0897f45-d46e-4567-a860-36bff16f107e', '9c300996-a8d9-4630-8a54-be29980e80db'),
('c0897f45-d46e-4567-a860-36bff16f107e', '9f0edc5a-d3a9-459e-964a-5ec94ea0b27b'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'bfea9058-10fa-4e9c-bb47-58f5928d3069'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'c176d5e9-e471-4a38-b71d-eaf183d074e0'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'd12e8f5d-2eff-4dcc-a90e-48f00bbcc2b6'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'd4d230b2-72ab-4e03-a819-659fee43a282'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'e65aeeab-4a47-4572-9f7e-c637d40c87ff'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'e6d9d43e-2e5e-4449-8633-190e01008315'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('c0897f45-d46e-4567-a860-36bff16f107e', 'f96cdf4d-cb18-4bb3-bfcf-026f51f3f124'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('c2b19679-1ed0-4a2d-880d-e99442643a45', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('c487df00-820d-44f9-9f30-3b743c51e944', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('c487df00-820d-44f9-9f30-3b743c51e944', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('c487df00-820d-44f9-9f30-3b743c51e944', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('c487df00-820d-44f9-9f30-3b743c51e944', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('c487df00-820d-44f9-9f30-3b743c51e944', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '0b113d75-3373-431f-80c6-8d04344ff585'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '82234ff9-345a-420b-884d-b2c3032291e9'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '9c300996-a8d9-4630-8a54-be29980e80db'),
('c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '0b113d75-3373-431f-80c6-8d04344ff585'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '82234ff9-345a-420b-884d-b2c3032291e9'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '9c24242c-b149-4ba4-bdc2-df3d46a5d6e0'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '9c300996-a8d9-4630-8a54-be29980e80db'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'dcfb19a2-df83-4c10-a808-cdd48db5f949'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('d5111b1a-edbf-420f-a8d2-92fc88adaee8', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('d56655b9-b48e-48b8-a9b3-8615d76b18d5', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('d56655b9-b48e-48b8-a9b3-8615d76b18d5', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('d56655b9-b48e-48b8-a9b3-8615d76b18d5', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('d56655b9-b48e-48b8-a9b3-8615d76b18d5', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '0b113d75-3373-431f-80c6-8d04344ff585'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '82234ff9-345a-420b-884d-b2c3032291e9'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '9c300996-a8d9-4630-8a54-be29980e80db'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('d8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('d9264568-4723-4876-a015-a262e0c85841', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('d9264568-4723-4876-a015-a262e0c85841', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('d9264568-4723-4876-a015-a262e0c85841', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('d9264568-4723-4876-a015-a262e0c85841', '6af71863-edbc-4d75-9e5a-c8ac3fe6d538'),
('db27d847-d056-4a56-be9a-136918deb308', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('db27d847-d056-4a56-be9a-136918deb308', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('db27d847-d056-4a56-be9a-136918deb308', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('db27d847-d056-4a56-be9a-136918deb308', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('db27d847-d056-4a56-be9a-136918deb308', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('dcbd3384-35e3-43fb-b229-3c273ba895f3', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('dcbd3384-35e3-43fb-b229-3c273ba895f3', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('dcbd3384-35e3-43fb-b229-3c273ba895f3', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('dcbd3384-35e3-43fb-b229-3c273ba895f3', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('deb35ca8-3169-4866-8327-99781855428a', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('deb35ca8-3169-4866-8327-99781855428a', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('deb35ca8-3169-4866-8327-99781855428a', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('deb35ca8-3169-4866-8327-99781855428a', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('e501b764-2d09-4f61-b6e2-e66226df7416', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('e501b764-2d09-4f61-b6e2-e66226df7416', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('e501b764-2d09-4f61-b6e2-e66226df7416', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('e501b764-2d09-4f61-b6e2-e66226df7416', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('e501b764-2d09-4f61-b6e2-e66226df7416', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '0b113d75-3373-431f-80c6-8d04344ff585'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('e5938c81-fd63-4265-9ea3-387ca3fc03aa', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '0b113d75-3373-431f-80c6-8d04344ff585'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '82234ff9-345a-420b-884d-b2c3032291e9'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('e6f1f5e2-a321-494b-baa0-e37fa0ee1691', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '0b113d75-3373-431f-80c6-8d04344ff585'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '0cb89b27-c91c-44d3-b80a-ff39cecc70c7'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '1cc3ef7b-2224-4012-b462-1d7501a6eb46'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '2c39bff4-da93-4270-aca4-68fe093b5e77'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '695def59-3ee4-4afb-ba6f-65f22266b517'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '82234ff9-345a-420b-884d-b2c3032291e9'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '8bb1f664-d130-4c9d-9dff-9b9f037f6586'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '999434a8-d21b-4f58-9b6d-85c25d22b42d'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '9c300996-a8d9-4630-8a54-be29980e80db'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', '9e0ca725-85eb-412f-9398-b3178bdbdcc6'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', 'c11927c7-d0d7-437c-abeb-a088c2ff1e0e'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('e7cee5b3-6b4f-433d-9578-09d10b853d8c', 'e0712558-e00e-4448-90ca-1c8d560bbbba'),
('ea6231b9-d475-4f11-a249-02be2fef5072', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('ea6231b9-d475-4f11-a249-02be2fef5072', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('ea6231b9-d475-4f11-a249-02be2fef5072', '8ecb4997-a8e8-475a-8d11-a8ec132339f7'),
('ea6231b9-d475-4f11-a249-02be2fef5072', '94b69160-7ec1-4e21-a725-deecc666ca7b'),
('ea6231b9-d475-4f11-a249-02be2fef5072', 'eae2faa5-b518-47ef-a5ae-6c770b5b21ec'),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', 'c9110296-9e23-4207-8389-3ee0a8fd1da7'),
('f07cc52d-6eaf-4d37-9334-9afbf07ec33c', 'e19ef4ab-51df-4b77-95d4-3009918728fd'),
('f4283a3d-b2f2-491e-a729-e1125ff111fb', '2696cc3e-54a3-42d1-b854-d3514cc6645c'),
('f4283a3d-b2f2-491e-a729-e1125ff111fb', '46ebd5dc-6bd3-41cd-b043-e7ca82601520'),
('f4283a3d-b2f2-491e-a729-e1125ff111fb', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('f4283a3d-b2f2-491e-a729-e1125ff111fb', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '0749a1c5-9c59-4107-bd74-e761e56d7f6a'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '0b113d75-3373-431f-80c6-8d04344ff585'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '0ea8e5c0-4c3c-4919-b12b-0a9c57c88794'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '207fafd4-0452-4dc8-a523-51110c6094fd'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '5bf08497-01db-48b2-a987-d6e7795b087e'),
('f62ac9d3-5385-47cf-bd12-58f7c87bb7c6', '63dc4dc3-01f9-4821-a6cb-d62afadd1b07');

-- --------------------------------------------------------

--
-- Table structure for table `savedreport`
--

CREATE TABLE `savedreport` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `type` enum('SALES','INVENTORY','WASTE','FOOD_COST') NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdById` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staffattendance`
--

CREATE TABLE `staffattendance` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `clockIn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `clockOut` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staffattendance`
--

INSERT INTO `staffattendance` (`id`, `tenantId`, `userId`, `clockIn`, `clockOut`) VALUES
('27bb247a-3700-4d91-b1ae-8da11d8a8e5a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '37a890bb-5f76-4550-890f-e3dbe9625c13', '2026-07-13 01:46:21.131', '2026-07-13 05:46:21.131'),
('74d2f626-4432-4fc8-ba89-97e7182717de', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '261ce6cc-f328-41c3-827b-c88926577cc1', '2026-07-13 01:46:21.651', '2026-07-13 05:46:21.651'),
('809b7a51-0009-4008-80c2-54d421201abb', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', '2026-07-13 01:46:21.137', '2026-07-13 05:46:21.137'),
('87d7f49c-c300-462b-b08a-f7e69805cdef', '1986a50c-b166-4771-87df-3d37f61d66a2', '12624367-7063-4d65-a3f7-88f7106521c5', '2026-07-13 01:46:20.960', '2026-07-13 05:46:20.960'),
('8e8421e9-a2b4-4143-b40b-c7eeced8153d', '1986a50c-b166-4771-87df-3d37f61d66a2', '11b7b3f8-176b-4c6c-abee-e704147c8446', '2026-07-13 01:46:20.957', '2026-07-13 05:46:20.957'),
('a067b327-894f-414c-8ed6-b397681382b8', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '348a2366-b1bd-4651-bbfa-b0ff6a25db80', '2026-07-13 01:46:20.742', '2026-07-13 05:46:20.742'),
('afecd34f-be2f-4f9d-992e-3d0534e13b03', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '33a4820c-6977-4a36-a9d6-ee859814a4cb', '2026-07-13 01:46:20.732', '2026-07-13 05:46:20.732'),
('bafbf9e6-22df-4c9c-a272-b54985fbbe51', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '3e271957-a42f-491d-8aac-e1c4f35da102', '2026-07-13 01:46:20.752', '2026-07-13 05:46:20.752'),
('d6a3b196-1c34-427d-aa15-c42ee9683a5c', '1986a50c-b166-4771-87df-3d37f61d66a2', '503b4d6d-c89f-4d5e-a792-c855374b17fb', '2026-07-13 01:46:20.964', '2026-07-13 05:46:20.964'),
('d9544016-be40-4255-8603-d5b8e663c248', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '3d956592-9ca9-4bb9-a302-dd00999ffa56', '2026-07-13 01:46:21.661', '2026-07-13 05:46:21.661'),
('f27cd120-816b-4d6d-aa50-02a8bf76ec9b', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '15b721bd-efde-4dd1-8e05-98bacb3d2879', '2026-07-13 01:46:21.128', '2026-07-13 05:46:21.128'),
('f2c7782c-d645-4b8f-81b8-8b14309fe6bf', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '34ee8023-99c7-4ce1-8988-249586b65450', '2026-07-13 01:46:21.656', '2026-07-13 05:46:21.656');

-- --------------------------------------------------------

--
-- Table structure for table `staffschedule`
--

CREATE TABLE `staffschedule` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `shiftDate` datetime(3) NOT NULL,
  `startTime` varchar(10) NOT NULL,
  `endTime` varchar(10) NOT NULL,
  `note` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staffschedule`
--

INSERT INTO `staffschedule` (`id`, `tenantId`, `branchId`, `userId`, `shiftDate`, `startTime`, `endTime`, `note`, `createdAt`) VALUES
('07ca5960-34b8-4a19-9e12-92e4ea744747', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '833fe73e-fac6-4e01-a8ce-79e57dabafea', '2026-07-16 06:46:20.946', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:20.952'),
('0d06ff3a-6a09-4dcd-bdbb-7a320c7e0308', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '12624367-7063-4d65-a3f7-88f7106521c5', '2026-07-14 06:46:20.938', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:20.945'),
('21bc0aca-6f21-480d-9114-a3e9d9465a61', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', '2026-07-15 06:46:21.111', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:21.118'),
('3a184914-a424-45f6-ac77-3c4d51f9120e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '3e271957-a42f-491d-8aac-e1c4f35da102', '2026-07-15 06:46:20.708', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:20.714'),
('3db983a4-f5fc-42a2-ba2b-1f807b1648e3', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '348a2366-b1bd-4651-bbfa-b0ff6a25db80', '2026-07-14 06:46:20.697', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:20.706'),
('4dc72989-dfa9-4818-8843-79aa55f9f726', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '57525bba-f528-4583-95c5-fb7dfff0ed72', '2026-07-16 06:46:21.115', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:21.123'),
('528d4a87-4c2d-4468-9774-1dca3472e29e', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '261ce6cc-f328-41c3-827b-c88926577cc1', '2026-07-13 06:46:21.625', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:21.631'),
('59cc5c1e-2e0c-4f0d-918f-e646e1d193c1', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '15b721bd-efde-4dd1-8e05-98bacb3d2879', '2026-07-13 06:46:21.105', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:21.112'),
('62ca8f8e-ec8d-4de3-9ad4-4d9621e85e86', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '11b7b3f8-176b-4c6c-abee-e704147c8446', '2026-07-13 06:46:20.935', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:20.941'),
('912685dc-5117-476b-b800-cc876150dece', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '503b4d6d-c89f-4d5e-a792-c855374b17fb', '2026-07-15 06:46:20.942', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:20.948'),
('934bfe82-61a4-476d-889f-17f79899551a', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '3d956592-9ca9-4bb9-a302-dd00999ffa56', '2026-07-15 06:46:21.632', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:21.638'),
('9bceafe2-8676-4510-9926-fa8785838f3d', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '37a890bb-5f76-4550-890f-e3dbe9625c13', '2026-07-14 06:46:21.109', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:21.115'),
('a6588211-047a-4c68-aaa5-9c54e4800be3', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '55bafa81-28ef-4f1c-946d-d2207efa6ff1', '2026-07-16 06:46:20.711', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:20.717'),
('c4bd5569-d0ef-4066-b467-595fd44c3286', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '2026-07-16 06:46:21.637', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:21.643'),
('d06ebdf5-ab33-4a71-a2d6-9fce768fc169', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '33a4820c-6977-4a36-a9d6-ee859814a4cb', '2026-07-13 06:46:20.691', '09:00', '17:00', 'Seeded demo shift', '2026-07-13 06:46:20.698'),
('e5f7247d-9897-4497-bd22-01df81c2f9c8', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '34ee8023-99c7-4ce1-8988-249586b65450', '2026-07-14 06:46:21.628', '14:00', '22:00', 'Seeded demo shift', '2026-07-13 06:46:21.635');

-- --------------------------------------------------------

--
-- Table structure for table `stockmovement`
--

CREATE TABLE `stockmovement` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `ingredientId` varchar(36) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `type` enum('STOCK_IN','STOCK_OUT','WASTE','TRANSFER_IN','TRANSFER_OUT') NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdById` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stockmovement`
--

INSERT INTO `stockmovement` (`id`, `tenantId`, `branchId`, `ingredientId`, `quantity`, `type`, `reason`, `createdAt`, `createdById`) VALUES
('463d1375-b6e4-45ec-b98d-f1ee268ae803', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 10.000, 'STOCK_IN', 'Seeded receiving demo', '2026-07-13 06:46:20.796', '7a0cf963-1389-4fa2-85de-7c610241d216'),
('700cfbf3-f376-46e0-8da9-14daccf4032a', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2cf29a43-a662-4133-a240-dbebada070e8', 10.000, 'STOCK_IN', 'Seeded receiving demo', '2026-07-13 06:46:21.001', '9cf93837-9c90-42bc-9cef-a40977391f92'),
('d93bd28d-0db0-45f7-bb70-bf10a1f04224', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '0b62770a-eb8c-44e8-8006-3fea73952c89', 10.000, 'STOCK_IN', 'Seeded receiving demo', '2026-07-13 06:46:21.687', '9d799d44-bc4d-4096-b572-d6b4ad39bb8a'),
('e40be4c3-200b-4985-ba34-d2b4658f6f34', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '406e51d5-0c4f-4991-9e5c-26060044f019', 10.000, 'STOCK_IN', 'Seeded receiving demo', '2026-07-13 06:46:21.163', '8d4313ef-208d-42db-b106-b20cfa240eee');

-- --------------------------------------------------------

--
-- Table structure for table `stocktransferrequest`
--

CREATE TABLE `stocktransferrequest` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `fromBranchId` varchar(36) NOT NULL,
  `toBranchId` varchar(36) NOT NULL,
  `ingredientId` varchar(36) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `status` enum('REQUESTED','APPROVED','IN_TRANSIT','COMPLETED','REJECTED') NOT NULL DEFAULT 'REQUESTED',
  `requestedById` varchar(36) NOT NULL,
  `approvedById` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocktransferrequest`
--

INSERT INTO `stocktransferrequest` (`id`, `tenantId`, `fromBranchId`, `toBranchId`, `ingredientId`, `quantity`, `status`, `requestedById`, `approvedById`, `createdAt`) VALUES
('cc56d701-5188-46f1-b000-e57e39d6119c', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', 'd8e5ce7e-e653-4b4c-94dd-2381a1edda17', '2cf29a43-a662-4133-a240-dbebada070e8', 5.000, 'REQUESTED', '9cf93837-9c90-42bc-9cef-a40977391f92', NULL, '2026-07-13 06:46:20.983');

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `stripeSubscriptionId` varchar(150) DEFAULT NULL,
  `planTier` enum('STARTER','GROWTH','ENTERPRISE') NOT NULL DEFAULT 'STARTER',
  `status` varchar(50) NOT NULL,
  `trialStart` datetime(3) DEFAULT NULL,
  `trialEnd` datetime(3) DEFAULT NULL,
  `currentPeriodStart` datetime(3) NOT NULL,
  `currentPeriodEnd` datetime(3) NOT NULL,
  `maxBranches` int(11) NOT NULL DEFAULT 1,
  `maxEmployees` int(11) NOT NULL DEFAULT 5,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`id`, `tenantId`, `stripeSubscriptionId`, `planTier`, `status`, `trialStart`, `trialEnd`, `currentPeriodStart`, `currentPeriodEnd`, `maxBranches`, `maxEmployees`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('2b3ca276-cc06-4ad9-9aac-4f42dd94e33b', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', NULL, 'ENTERPRISE', 'ACTIVE', NULL, NULL, '2026-07-13 05:23:33.128', '2026-08-13 05:23:33.128', 100, 500, '2026-07-13 05:23:33.130', '2026-07-13 05:23:33.130', NULL),
('954d87a1-8540-459d-9332-17be89111148', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', NULL, 'STARTER', 'TRIALING', '2026-07-13 05:23:33.369', '2026-08-13 05:23:33.369', '2026-07-13 05:23:33.369', '2026-08-13 05:23:33.369', 1, 10, '2026-07-13 05:23:33.371', '2026-07-13 05:23:33.371', NULL),
('cfb424b2-f0c4-42f5-ac8e-f41c9d34bce8', '1986a50c-b166-4771-87df-3d37f61d66a2', NULL, 'GROWTH', 'ACTIVE', NULL, NULL, '2026-07-13 05:23:32.492', '2026-08-13 05:23:32.492', 5, 50, '2026-07-13 05:23:32.496', '2026-07-13 05:23:32.496', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptionplan`
--

CREATE TABLE `subscriptionplan` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `tier` enum('STARTER','GROWTH','ENTERPRISE') NOT NULL,
  `priceMonthly` decimal(12,2) NOT NULL,
  `maxBranches` int(11) NOT NULL,
  `maxEmployees` int(11) NOT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptionplan`
--

INSERT INTO `subscriptionplan` (`id`, `name`, `tier`, `priceMonthly`, `maxBranches`, `maxEmployees`, `features`, `isActive`, `createdAt`) VALUES
('439c1b82-4ad4-48ed-b2d5-31a07ca0f586', 'Enterprise', 'ENTERPRISE', 349.00, 100, 500, '{\"pos\":true,\"inventory\":true,\"kds\":true,\"multiBranch\":true,\"advancedReports\":true,\"delivery\":true,\"apiAccess\":true,\"dedicatedSupport\":true,\"customIntegrations\":true}', 1, '2026-07-13 05:17:47.361'),
('b5978758-d0fe-4666-a011-e5a76a57061e', 'Growth', 'GROWTH', 129.00, 5, 50, '{\"pos\":true,\"inventory\":true,\"kds\":true,\"multiBranch\":true,\"advancedReports\":true,\"delivery\":true}', 1, '2026-07-13 05:17:47.361'),
('e1066c26-640c-4ecc-b59f-1e4c217b6317', 'Starter', 'STARTER', 49.00, 1, 10, '{\"pos\":true,\"inventory\":true,\"kds\":true,\"multiBranch\":false,\"advancedReports\":false}', 1, '2026-07-13 05:17:47.361');

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contactName` varchar(150) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`id`, `tenantId`, `name`, `contactName`, `phone`, `email`, `createdAt`, `deletedAt`) VALUES
('1a6858a4-f5ab-47b5-9538-78f39934dd8e', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Pacific Catch Distributors', 'Elena Vargas', '+13105550990', 'elena@pacificcatch.com', '2026-07-13 05:23:33.346', NULL),
('43f085cc-0e2f-496c-bb05-3c88a3a6926a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Manhattan Fresh Dairy Farms', 'Sarah Jenkins', '+15553334444', 'sarah@manhattandairy.com', '2026-07-10 11:21:30.535', NULL),
('57e10ea9-a624-4686-b1d9-82852cc05495', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Bengaluru Fresh Meats', 'Ravi Kumar', '+918098760011', 'ravi@bfmeats.in', '2026-07-13 05:23:33.086', NULL),
('94be3049-7c16-4c6f-a6d8-299e05c1a14f', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'NYC Roasters & Co.', 'Dave Miller', '+12129990188', 'dave@nycroasters.com', '2026-07-10 11:21:30.518', NULL),
('952b6b7c-5516-40a6-8e53-71bc196305aa', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Spice Route Traders', 'Meera Shah', '+918098760022', 'meera@spiceroute.in', '2026-07-13 05:23:33.093', NULL),
('d31ebaf0-c428-4317-b245-c805dd42d560', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'London Organic Produce', 'Hannah Brooks', '+442079460999', 'hannah@londonorganic.co.uk', '2026-07-13 05:23:33.882', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supportticket`
--

CREATE TABLE `supportticket` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `priority` varchar(30) NOT NULL DEFAULT 'MEDIUM',
  `requesterEmail` varchar(150) NOT NULL,
  `assigneeName` varchar(150) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supportticket`
--

INSERT INTO `supportticket` (`id`, `tenantId`, `subject`, `description`, `status`, `priority`, `requesterEmail`, `assigneeName`, `createdAt`, `updatedAt`) VALUES
('242a5383-e1c4-4f86-afe4-a9c159226756', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Onboarding checklist — Green Leaf Cafe', 'Tenant seeded for platform demo. Confirm billing and feature flags.', 'OPEN', 'MEDIUM', 'owner@greenleafcafe.co.uk', 'Platform Support', '2026-07-13 05:23:33.901', '2026-07-13 05:23:33.901'),
('69137b3b-7574-4d9e-aad5-cbb183387a33', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Invoice PDF download', 'Requesting PDF copies of the last 3 invoices for accounting.', 'IN_PROGRESS', 'MEDIUM', 'accountant@tastyc.com', 'Billing Desk', '2026-07-13 05:17:47.415', '2026-07-13 05:17:47.415'),
('6c080be7-9775-44bf-b56c-e09d48559fdf', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Unable to add a second branch', 'Owner reports Growth plan should allow 5 branches but UI blocks creation.', 'OPEN', 'HIGH', 'owner@tastyc.com', 'Platform Support', '2026-07-13 05:17:47.415', '2026-07-13 05:17:47.415'),
('71c28616-b574-4e0b-b9e9-b2ac17089b58', NULL, 'API access request', 'Prospect asking about Enterprise API rate limits before signing up.', 'OPEN', 'LOW', 'prospect@example.com', NULL, '2026-07-13 05:17:47.415', '2026-07-13 05:17:47.415'),
('8a589759-4830-4620-a2a5-e107ac8f127a', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Onboarding checklist — Ocean Bistro', 'Tenant seeded for platform demo. Confirm billing and feature flags.', 'OPEN', 'MEDIUM', 'owner@oceanbistro.com', 'Platform Support', '2026-07-13 05:23:33.360', '2026-07-13 05:23:33.360'),
('d8875b7a-544c-4afc-b877-82b5161a5456', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Onboarding checklist — Spice Haven Kitchen', 'Tenant seeded for platform demo. Confirm billing and feature flags.', 'OPEN', 'MEDIUM', 'owner@spicehaven.com', 'Platform Support', '2026-07-13 05:23:33.117', '2026-07-13 05:23:33.117');

-- --------------------------------------------------------

--
-- Table structure for table `systemannouncement`
--

CREATE TABLE `systemannouncement` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `audience` varchar(50) NOT NULL DEFAULT 'ALL',
  `startsAt` datetime(3) DEFAULT NULL,
  `endsAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systemannouncement`
--

INSERT INTO `systemannouncement` (`id`, `title`, `body`, `audience`, `startsAt`, `endsAt`, `isActive`, `createdAt`) VALUES
('26f7772c-be2a-4f05-82ff-84092b695128', 'Scheduled maintenance window', 'Platform maintenance is planned every Sunday 02:00–04:00 UTC. Expect brief read-only periods.', 'ALL', '2026-07-13 05:17:47.384', '2026-08-12 05:17:47.384', 1, '2026-07-13 05:17:47.395'),
('2e7dc53e-8dab-4daf-a7bc-1fdbbbb52bb9', 'Welcome to Tastyc Platform Admin', 'Use this console to manage tenants, billing, feature flags, and platform integrations.', 'SUPER_ADMIN', '2026-07-13 05:17:47.384', NULL, 1, '2026-07-13 05:17:47.395');

-- --------------------------------------------------------

--
-- Table structure for table `table`
--

CREATE TABLE `table` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `floorId` varchar(36) NOT NULL,
  `number` varchar(50) NOT NULL,
  `seatingCapacity` int(11) NOT NULL DEFAULT 2,
  `qrToken` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `table`
--

INSERT INTO `table` (`id`, `tenantId`, `floorId`, `number`, `seatingCapacity`, `qrToken`) VALUES
('0e5935a4-33c1-4000-86eb-9ff3dbf71c43', '1986a50c-b166-4771-87df-3d37f61d66a2', '8a995be8-9ea6-4b5b-9e56-2c7cb9574327', 'D01', 2, 'qr-1986a50c-6bfd96-d01'),
('1843eb82-a9ed-4329-b4ef-5f1d04dfed10', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '72f88fbb-d2cf-4fea-8681-ab679904883b', 'O03', 2, 'qr-73abee05-2c600b-o03'),
('1911d3b5-0333-4127-ac4b-93b1e34dec54', '1986a50c-b166-4771-87df-3d37f61d66a2', '785b26c1-f4b6-42c3-b184-4ddaaba15bef', 'M03', 2, 'qr-1986a50c-d8e5ce-m03'),
('1b0b06d5-f330-4c33-ab47-b23a9b0749d6', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '72f88fbb-d2cf-4fea-8681-ab679904883b', 'O02', 4, 'qr-73abee05-2c600b-o02'),
('217ea73f-f6f3-40de-bb7c-e1185e481b5f', '1986a50c-b166-4771-87df-3d37f61d66a2', '8a995be8-9ea6-4b5b-9e56-2c7cb9574327', 'D04', 4, 'qr-1986a50c-6bfd96-d04'),
('2463c2ce-b589-455f-8a12-4347a03ad58b', '1986a50c-b166-4771-87df-3d37f61d66a2', '8a995be8-9ea6-4b5b-9e56-2c7cb9574327', 'D02', 4, 'qr-1986a50c-6bfd96-d02'),
('25c10248-9a2a-483f-a716-ab45a9251807', '1986a50c-b166-4771-87df-3d37f61d66a2', '8a995be8-9ea6-4b5b-9e56-2c7cb9574327', 'D03', 2, 'qr-1986a50c-6bfd96-d03'),
('271fe83c-b008-416c-890f-d6123da19fc9', '1986a50c-b166-4771-87df-3d37f61d66a2', '4f631118-630b-495f-b175-2b36c36d78e8', 'P02', 4, 'qr-1986a50c-6bfd96-p02'),
('283c618b-201d-4ad7-8d14-7f52d7045c09', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1645e00a-5372-4adb-9ab8-6084bd1771e0', 'T03', 4, 'qr-t03'),
('2e267f9d-fda8-4071-a6c3-3a5c714a7d0c', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '21662aaa-6b17-450c-ab1c-378ea83cd822', 'G02', 4, 'qr-60cfbbf7-d5cb1b-g02'),
('2f43f015-a85a-4cf5-b1f5-009c45f78e32', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '21662aaa-6b17-450c-ab1c-378ea83cd822', 'G03', 2, 'qr-60cfbbf7-d5cb1b-g03'),
('3e1a5d65-0a14-4517-b461-a448e8084154', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '72f88fbb-d2cf-4fea-8681-ab679904883b', 'O04', 4, 'qr-73abee05-2c600b-o04'),
('3fe69131-619b-4b35-8e5a-e6482d8d28b6', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '21662aaa-6b17-450c-ab1c-378ea83cd822', 'G04', 4, 'qr-60cfbbf7-d5cb1b-g04'),
('5b0ec615-b174-49f6-ae3e-076d8c0ee0fa', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'dd95d109-b3e2-4a21-98ee-21585c8ff8b0', 'P01', 2, 'qr-p01'),
('67387fee-2f3d-4b60-85f9-abf93fd60386', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1645e00a-5372-4adb-9ab8-6084bd1771e0', 'T02', 4, 'qr-t02'),
('7f55a654-7a32-417f-bba3-1e81eac6c69d', '1986a50c-b166-4771-87df-3d37f61d66a2', '4f631118-630b-495f-b175-2b36c36d78e8', 'P01', 2, 'qr-1986a50c-6bfd96-p01'),
('8106584d-2d1c-4404-9042-20dcce0d1eff', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '1645e00a-5372-4adb-9ab8-6084bd1771e0', 'T01', 2, 'qr-t01'),
('99e639ed-d50f-4156-99b7-85f5b04bbde4', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '1e8af85e-66ab-4809-9e07-40a97ed585c7', 'M02', 4, 'qr-60cfbbf7-d5cb1b-m02'),
('a26497e6-50ce-4f03-a819-bb37b3dc6a18', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '21662aaa-6b17-450c-ab1c-378ea83cd822', 'G01', 2, 'qr-60cfbbf7-d5cb1b-g01'),
('aa526b5d-ebac-47a0-b7e7-c3df94262d85', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '72f88fbb-d2cf-4fea-8681-ab679904883b', 'O01', 2, 'qr-73abee05-2c600b-o01'),
('b7de425e-d8b9-4588-8d09-b57ebae34559', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '468745b0-4ae8-4f7a-bb70-e88caea2713d', 'B01', 2, 'qr-73abee05-2c600b-b01'),
('c4bf7bbb-5337-431b-a24b-95c28162a4d7', '1986a50c-b166-4771-87df-3d37f61d66a2', '785b26c1-f4b6-42c3-b184-4ddaaba15bef', 'M01', 2, 'qr-1986a50c-d8e5ce-m01'),
('c627395c-69eb-4811-9a1f-c8bd228b5119', '1986a50c-b166-4771-87df-3d37f61d66a2', '785b26c1-f4b6-42c3-b184-4ddaaba15bef', 'M02', 4, 'qr-1986a50c-d8e5ce-m02'),
('c7d3b493-6596-430d-bb0c-99c93eab59dd', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'dd95d109-b3e2-4a21-98ee-21585c8ff8b0', 'P02', 4, 'qr-p02'),
('e5ad5754-90d7-4bab-b15d-f973b77661c2', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', '1e8af85e-66ab-4809-9e07-40a97ed585c7', 'M01', 2, 'qr-60cfbbf7-d5cb1b-m01'),
('edec5bd5-3fe3-4e60-9e51-7a478306d289', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '468745b0-4ae8-4f7a-bb70-e88caea2713d', 'B02', 4, 'qr-73abee05-2c600b-b02'),
('f6b5731e-3c93-43e1-a81d-93aa7292a4c0', '1986a50c-b166-4771-87df-3d37f61d66a2', '785b26c1-f4b6-42c3-b184-4ddaaba15bef', 'M04', 4, 'qr-1986a50c-d8e5ce-m04');

-- --------------------------------------------------------

--
-- Table structure for table `tenant`
--

CREATE TABLE `tenant` (
  `id` varchar(36) NOT NULL,
  `name` varchar(191) NOT NULL,
  `companyName` varchar(191) NOT NULL,
  `status` enum('ACTIVE','SUSPENDED','TRIAL','CANCELLED') NOT NULL DEFAULT 'TRIAL',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenant`
--

INSERT INTO `tenant` (`id`, `name`, `companyName`, `status`, `createdAt`, `updatedAt`, `deletedAt`, `slug`) VALUES
('1986a50c-b166-4771-87df-3d37f61d66a2', 'Spice Haven Kitchen', 'Spice Haven Hospitality Pvt Ltd', 'ACTIVE', '2026-07-13 05:23:32.473', '2026-07-13 05:42:06.915', NULL, 'spice-haven-kitchen'),
('60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Green Leaf Cafe', 'Green Leaf Wellness Cafes Ltd', 'TRIAL', '2026-07-13 05:23:33.365', '2026-07-13 05:42:06.931', NULL, 'green-leaf-cafe'),
('73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Ocean Bistro', 'Ocean Bistro Seafood LLC', 'ACTIVE', '2026-07-13 05:23:33.122', '2026-07-13 05:42:06.926', NULL, 'ocean-bistro'),
('a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Tastyc Coffee House', 'Tastyc Operations Ltd.', 'ACTIVE', '2026-07-10 11:21:29.472', '2026-07-13 05:42:06.908', NULL, 'tastyc-coffee-house');

-- --------------------------------------------------------

--
-- Table structure for table `tenantsettings`
--

CREATE TABLE `tenantsettings` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `timezone` varchar(100) NOT NULL DEFAULT 'UTC',
  `lowStockNotification` tinyint(1) NOT NULL DEFAULT 1,
  `autoCloseShiftsAt` varchar(10) DEFAULT NULL,
  `appName` varchar(100) NOT NULL DEFAULT 'Tastyc',
  `logo` text DEFAULT NULL,
  `favicon` text DEFAULT NULL,
  `homeBannerTitle` varchar(255) NOT NULL DEFAULT 'Savor Every Moment',
  `homeBannerSubtitle` text NOT NULL DEFAULT 'Welcome to Tastyc Coffee House, where coffee meets cozy luxury.',
  `homeBannerImage` text DEFAULT NULL,
  `ourStoryTitle` varchar(255) NOT NULL DEFAULT 'Our Legacy & Craft',
  `ourStoryContent` text NOT NULL DEFAULT 'Established with a passion for roasting premium quality beans, Tastyc has grown into a neighborhood staple. Every cup is brewed with meticulous precision to deliver an unforgettable taste profile.',
  `ourStoryImage` text DEFAULT NULL,
  `platformHighlights` text NOT NULL DEFAULT '100% Organic Beans, Artisanal Brewing, Cozy Atmosphere, Fresh Pastries',
  `highlightsTitle` varchar(255) NOT NULL DEFAULT 'Engineered For Excellence',
  `highlightsDescription` text NOT NULL DEFAULT 'Platform Highlights',
  `coffeeHouseCaption` varchar(255) NOT NULL DEFAULT 'Artisan Coffee & Cozy Spaces',
  `hoursOfService` text NOT NULL DEFAULT 'Monday - Friday: 7:00 AM - 9:00 PM, Saturday - Sunday: 8:00 AM - 10:00 PM',
  `findUsAddress` text NOT NULL DEFAULT '123 Luxury Lounge Blvd, Coffee District, CA 90210',
  `findUsPhone` varchar(50) NOT NULL DEFAULT '+1 (555) 123-4567',
  `findUsEmail` varchar(100) NOT NULL DEFAULT 'hello@tastyc.com',
  `findUsMapUrl` text DEFAULT NULL,
  `footerContent` text NOT NULL DEFAULT '© 2026 Tastyc. All rights reserved. Crafted for food and coffee lovers.',
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenantsettings`
--

INSERT INTO `tenantsettings` (`id`, `tenantId`, `currency`, `timezone`, `lowStockNotification`, `autoCloseShiftsAt`, `appName`, `logo`, `favicon`, `homeBannerTitle`, `homeBannerSubtitle`, `homeBannerImage`, `ourStoryTitle`, `ourStoryContent`, `ourStoryImage`, `platformHighlights`, `highlightsTitle`, `highlightsDescription`, `coffeeHouseCaption`, `hoursOfService`, `findUsAddress`, `findUsPhone`, `findUsEmail`, `findUsMapUrl`, `footerContent`, `updatedAt`) VALUES
('2a1442a3-3e29-4fde-aa35-86ba64402d90', '1986a50c-b166-4771-87df-3d37f61d66a2', 'INR', 'Asia/Kolkata', 1, NULL, 'Spice Haven Kitchen', NULL, NULL, 'Spice Haven Kitchen', 'Bold Indian flavours — order online and book a table.', NULL, 'Our Legacy & Craft', 'Established with a passion for roasting premium quality beans, Tastyc has grown into a neighborhood staple. Every cup is brewed with meticulous precision to deliver an unforgettable taste profile.', NULL, 'Fresh ingredients, Warm hospitality, Fast digital ordering', 'Why dine with us', 'Guest experience', 'Spice Haven · Digital storefront', 'Monday - Sunday: 10:00 AM - 10:00 PM', '12th Main, Indiranagar, Bengaluru 560038', '+918012345001', 'indiranagar@spicehaven.com', NULL, '© 2026 Spice Haven Kitchen. Powered by Tastyc.', '2026-07-13 05:55:45.886'),
('531577d6-5879-4bab-8e41-355618cdd8d8', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'GBP', 'Europe/London', 1, NULL, 'Green Leaf Cafe', NULL, NULL, 'Green Leaf Cafe', 'Plant-forward bowls and juices in Shoreditch.', NULL, 'Our Legacy & Craft', 'Established with a passion for roasting premium quality beans, Tastyc has grown into a neighborhood staple. Every cup is brewed with meticulous precision to deliver an unforgettable taste profile.', NULL, 'Fresh ingredients, Warm hospitality, Fast digital ordering', 'Why dine with us', 'Guest experience', 'Green Leaf · Wellness cafe', 'Monday - Sunday: 10:00 AM - 10:00 PM', '88 Brick Lane, London E1 6RL', '+442079460123', 'shoreditch@greenleafcafe.co.uk', NULL, '© 2026 Green Leaf Cafe. Powered by Tastyc.', '2026-07-13 05:55:45.917'),
('5a2da6cc-dfbb-4220-9213-3b3385a8b249', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'AED', 'Asia/Dubai', 1, NULL, 'Tastyc', '', '', 'Savor Every Moment', 'Welcome to Tastyc Coffee House, where coffee meets cozy luxury.', '', 'Our Legacy & Craft', 'Established with a passion for roasting premium quality beans, Tastyc has grown into a neighborhood staple. Every cup is brewed with meticulous precision to deliver an unforgettable taste profile.', '', '100% Organic Beans, Artisanal Brewing, Cozy Atmosphere, Fresh Pastries', 'Engineered For Excellence', 'Platform Highlights', 'Artisan Coffee & Cozy Spaces', 'Monday - Friday: 7:00 AM - 9:00 PM, Saturday - Sunday: 8:00 AM - 10:00 PM', '123 Luxury Lounge Blvd, Coffee District, CA 90210', '+1 (555) 123-4567', 'hello@tastyc.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1837926296316!2d-73.98542768459375!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c1054973%3A0x727e4e1671239855!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1652399238384!5m2!1sen!2sus', '© 2026 Tastyc. All rights reserved. Crafted for food and coffee lovers.', '2026-07-13 06:57:08.107'),
('94db53fb-759a-4bcb-b00e-0b5ca765bb19', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'USD', 'America/Los_Angeles', 1, NULL, 'Ocean Bistro', NULL, NULL, 'Ocean Bistro', 'Coastal seafood in Santa Monica — reserve your table.', NULL, 'Our Legacy & Craft', 'Established with a passion for roasting premium quality beans, Tastyc has grown into a neighborhood staple. Every cup is brewed with meticulous precision to deliver an unforgettable taste profile.', NULL, 'Fresh ingredients, Warm hospitality, Fast digital ordering', 'Why dine with us', 'Guest experience', 'Ocean Bistro · Digital storefront', 'Monday - Sunday: 10:00 AM - 10:00 PM', '1440 Ocean Ave, Santa Monica, CA 90401', '+13105550110', 'santamonica@oceanbistro.com', NULL, '© 2026 Ocean Bistro. Powered by Tastyc.', '2026-07-13 05:55:45.908');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `roleId` varchar(36) NOT NULL,
  `branchId` varchar(36) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `tenantId`, `email`, `passwordHash`, `name`, `phone`, `roleId`, `branchId`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('11b7b3f8-176b-4c6c-abee-e704147c8446', '1986a50c-b166-4771-87df-3d37f61d66a2', 'waiter@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Server Rohan Das', '+10000000000', '67df9ae2-1e25-4d09-af96-e2de45dd95fc', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2026-07-13 05:23:33.029', '2026-07-13 07:23:25.306', NULL),
('12624367-7063-4d65-a3f7-88f7106521c5', '1986a50c-b166-4771-87df-3d37f61d66a2', 'areamanager@tastyc.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Area Manager Priya', NULL, '19ccd81a-75f9-4b69-a500-b3029d98c3cb', NULL, '2026-07-13 06:31:16.968', '2026-07-13 07:23:25.360', NULL),
('15b721bd-efde-4dd1-8e05-98bacb3d2879', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'chef@oceanbistro.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Chef Luca Romano', '+10000000000', '921f4eaa-7d54-4487-b5cb-8400a3b7ad76', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '2026-07-13 05:23:33.292', '2026-07-13 07:23:25.392', NULL),
('231234a1-e5b9-4cf7-b411-1bda0943e1a1', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'customer@greenleafcafe.co.uk', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Amelia Wright (Customer)', '+10000000000', 'd56655b9-b48e-48b8-a9b3-8615d76b18d5', NULL, '2026-07-13 05:23:33.836', '2026-07-13 07:23:25.443', NULL),
('261ce6cc-f328-41c3-827b-c88926577cc1', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'manager@greenleafcafe.co.uk', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Noah Patel (Manager)', '+10000000000', 'd8ef34c3-0054-4a9b-a1f0-92a5ccef0d77', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '2026-07-13 05:23:33.822', '2026-07-13 07:23:25.458', NULL),
('33a4820c-6977-4a36-a9d6-ee859814a4cb', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'purchase@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Purchase Officer Peter', '+15550002222', 'e5938c81-fd63-4265-9ea3-387ca3fc03aa', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.143', '2026-07-10 11:21:30.143', NULL),
('348a2366-b1bd-4651-bbfa-b0ff6a25db80', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'deliverymanager@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Logistics Manager Dan', '+15550002222', 'd9264568-4723-4876-a015-a262e0c85841', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.149', '2026-07-10 11:21:30.149', NULL),
('34ee8023-99c7-4ce1-8988-249586b65450', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'cashier@greenleafcafe.co.uk', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Cashier Theo Grant', '+10000000000', '196639c5-126c-4f09-8329-f96887a0d58c', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '2026-07-13 05:23:33.832', '2026-07-13 07:23:25.472', NULL),
('37a890bb-5f76-4550-890f-e3dbe9625c13', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'manager@oceanbistro.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Sofia Alvarez (Manager)', '+10000000000', '89db28a2-21d5-4491-a0e5-d0be1d8836e1', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '2026-07-13 05:23:33.288', '2026-07-13 07:23:25.490', NULL),
('3ad55f4f-fc16-45ab-8cd2-f40fe4ba22e4', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'cashier@oceanbistro.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Cashier Mia Park', '+10000000000', 'ad55a614-5052-4292-996b-97be0ec1c882', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '2026-07-13 05:23:33.296', '2026-07-13 07:23:25.511', NULL),
('3d956592-9ca9-4bb9-a302-dd00999ffa56', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'areamanager@tastyc.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Area Manager Priya', NULL, '0d9be862-70d4-49a9-be4f-383c37ae3adc', NULL, '2026-07-13 06:31:17.138', '2026-07-13 07:23:25.526', NULL),
('3e271957-a42f-491d-8aac-e1c4f35da102', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'inventory@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Inventory Manager Carl', '+15550002222', '9300bb91-8a37-46bc-ae9f-0fee8e34f8cb', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.137', '2026-07-10 11:21:30.137', NULL),
('503b4d6d-c89f-4d5e-a792-c855374b17fb', '1986a50c-b166-4771-87df-3d37f61d66a2', 'cashier@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Cashier Priya Nair', '+10000000000', '4d5265ec-e9e3-4d8a-bb8b-12fa349512fc', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2026-07-13 05:23:33.022', '2026-07-13 07:23:25.543', NULL),
('55bafa81-28ef-4f1c-946d-d2207efa6ff1', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'kitchenmanager@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Kitchen Manager Sarah', '+15550002222', 'a30a9796-3eda-4e90-b14c-4ebb313388b2', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.100', '2026-07-10 11:21:30.100', NULL),
('57525bba-f528-4583-95c5-fb7dfff0ed72', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'areamanager@tastyc.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Area Manager Priya', NULL, 'c9ffd7b2-b271-4b5d-a5e3-863b84a1b20f', NULL, '2026-07-13 06:31:17.291', '2026-07-13 07:23:25.557', NULL),
('64e809cd-2729-4f5a-9ea6-3ffb7166db57', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'accountant@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Accountant Arthur', '+15550002222', 'c2b19679-1ed0-4a2d-880d-e99442643a45', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.168', '2026-07-10 11:21:30.168', NULL),
('6ac3e8f0-8eba-4748-9005-d174c8930512', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'kitchenstaff@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Kitchen Prep Anna', '+15550002222', '054ae9da-3c63-45e7-ba2e-4d4ae6666448', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.124', '2026-07-10 11:21:30.124', NULL),
('70468d30-9e55-4a79-bdee-5a39c07458a8', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'souschef@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Sous Chef Leon', '+15550002222', '3974c996-e976-49ce-93f7-d17221406bf5', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.116', '2026-07-10 11:21:30.116', NULL),
('760c87a4-a1e1-4ca1-b454-d90ea01349c0', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'hr@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'HR Officer Helen', '+15550002222', '20e6fa8e-705e-4feb-8355-89003238b29e', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.162', '2026-07-10 11:21:30.162', NULL),
('7a0cf963-1389-4fa2-85de-7c610241d216', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'owner@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Elena Rostova (Owner)', '+15550002222', 'a54d74a2-fb80-447b-8eb9-e98d6ab0a70a', NULL, '2026-07-10 11:21:30.028', '2026-07-10 11:21:30.028', NULL),
('7cdbc6bd-8d91-437d-86c3-e95338e0c96b', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'customer@oceanbistro.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Jordan Lee (Customer)', '+10000000000', 'deb35ca8-3169-4866-8327-99781855428a', NULL, '2026-07-13 05:23:33.299', '2026-07-13 07:23:25.575', NULL),
('833fe73e-fac6-4e01-a8ce-79e57dabafea', '1986a50c-b166-4771-87df-3d37f61d66a2', 'manager@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Vikram Iyer (Branch Manager)', '+10000000000', '4d20e898-ce1e-4ae7-9df3-baebed833a7d', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2026-07-13 05:23:33.017', '2026-07-13 07:23:25.589', NULL),
('8d4313ef-208d-42db-b106-b20cfa240eee', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'owner@oceanbistro.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Marcus Chen (Owner)', '+10000000000', '141c64cc-457a-44c0-a7b4-92ccf4e5180d', NULL, '2026-07-13 05:23:33.285', '2026-07-13 07:23:25.602', NULL),
('97276f31-4675-48f9-92de-6693e4875f52', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'marketing@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Marketing Exec Mary', '+15550002222', 'bcad366f-3d2e-45eb-88f8-b13c591d8597', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.175', '2026-07-10 11:21:30.175', NULL),
('9cf93837-9c90-42bc-9cef-a40977391f92', '1986a50c-b166-4771-87df-3d37f61d66a2', 'owner@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Ananya Reddy (Owner)', '+10000000000', '15aa808c-6230-4ee8-87cc-7ff6217f5922', NULL, '2026-07-13 05:23:33.014', '2026-07-13 07:23:25.610', NULL),
('9d799d44-bc4d-4096-b572-d6b4ad39bb8a', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'owner@greenleafcafe.co.uk', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Olivia Hart (Owner)', '+10000000000', 'd5111b1a-edbf-420f-a8d2-92fc88adaee8', NULL, '2026-07-13 05:23:33.817', '2026-07-13 07:23:25.623', NULL),
('9f764acf-f2c5-4e2d-a005-fd04b41211cb', NULL, 'superadmin@restaurantops.com', '$2a$10$BYRoMy5s40lsq.Letm6iSuJu8iFH9PMAnuBuQwV8Pc.7SsGF9NoFe', 'Platform Super Admin', NULL, '65dd1ee4-3cbe-449a-824a-24e62e34d81f', NULL, '2026-07-13 04:46:25.927', '2026-07-13 05:17:47.155', NULL),
('ac1549ac-ab90-4bde-956f-9dcc250d649b', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'chef@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Head Chef Marcus', '+15550002222', 'e501b764-2d09-4f61-b6e2-e66226df7416', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.108', '2026-07-10 11:21:30.108', NULL),
('b317467b-28b9-4fd6-8f37-ae168492aba4', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'cashier@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Cashier Emma', '+15550002222', '5095bc5c-3377-4f21-b1d2-894b12c43996', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.130', '2026-07-10 11:21:30.130', NULL),
('bae33faa-9a3a-44c6-bbba-b83edaf92533', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'manager@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Branch Manager Dave', '+15550002222', 'e7cee5b3-6b4f-433d-9578-09d10b853d8c', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.094', '2026-07-10 11:21:30.094', NULL),
('c7070bb9-d178-46c2-b474-d7896370f52f', '1986a50c-b166-4771-87df-3d37f61d66a2', 'chef@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Chef Arjun Malhotra', '+10000000000', 'db27d847-d056-4a56-be9a-136918deb308', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2026-07-13 05:23:33.019', '2026-07-13 07:23:25.639', NULL),
('c77054fe-8b55-40f0-9ad8-819da1f4fab4', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'auditor@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Compliance Auditor Alan', '+15550002222', '2a6a0c57-e3b7-4b0a-b131-c08bf655935e', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.181', '2026-07-10 11:21:30.181', NULL),
('c78947f8-c609-497d-b30f-1712ee13dc81', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'delivery@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Delivery Driver Ryan', '+15550002222', '963c85a5-8a22-45ca-aa97-c056235906ae', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.156', '2026-07-10 11:21:30.156', NULL),
('dea3cce1-10f7-42b8-b79e-c48858caabc8', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'chef@greenleafcafe.co.uk', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Chef Isla Quinn', '+10000000000', 'b8190cbd-da93-40ef-9d36-ee770fb76f9b', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '2026-07-13 05:23:33.826', '2026-07-13 07:23:25.657', NULL),
('e10acb71-c6df-484d-bcaf-1c0a0ad504ef', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'areamanager@tastyc.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Area Manager Priya', NULL, 'bc5627b8-868f-4262-a050-bcf355fa35d0', NULL, '2026-07-13 04:46:25.935', '2026-07-13 07:23:25.670', NULL),
('e2156806-3da9-4151-af64-4648f7ba1c37', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'customer@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Alice Johnson (Customer)', '+15550002222', '534c9e6e-b3d8-4c25-81e6-680f27dc95ee', NULL, '2026-07-10 11:21:30.195', '2026-07-10 11:21:30.195', NULL),
('eb8214b0-07d2-4f28-b515-27a73c144b5e', '1986a50c-b166-4771-87df-3d37f61d66a2', 'customer@spicehaven.com', '$2a$10$BoGRmotU0M8hFeRm05KL1uge6NHaAimrCJg3hMt7WmkxZ5sFWMlpu', 'Kabir Mehta (Customer)', '+10000000000', '3edd11f7-b8df-40bb-9a51-a0aedacd3848', NULL, '2026-07-13 05:23:33.032', '2026-07-13 07:23:25.676', NULL),
('f75cc34f-03d6-4696-b442-bdc1e002470a', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'waiter@tastyc.com', '$2a$10$x2LNvXzIfNdg44g4PbWAfuGajrOW3fuxYdG3QvJI5j8hNakN0g1tO', 'Server Toby', '+15550002222', '315be33d-dabe-4079-81b2-facfcc496a78', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '2026-07-10 11:21:30.189', '2026-07-10 11:21:30.189', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `waitinglist`
--

CREATE TABLE `waitinglist` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `customerName` varchar(150) NOT NULL,
  `customerPhone` varchar(50) NOT NULL,
  `partySize` int(11) NOT NULL DEFAULT 2,
  `status` varchar(30) NOT NULL DEFAULT 'WAITING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `waitinglist`
--

INSERT INTO `waitinglist` (`id`, `tenantId`, `customerName`, `customerPhone`, `partySize`, `status`, `createdAt`) VALUES
('392db147-1648-4865-a9a2-9f74b8d4134e', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Sam Patel', '+15550103', 3, 'WAITING', '2026-07-13 06:46:21.087'),
('ac9457b7-85b4-4492-bc04-0774b9aa827e', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Riley Gomez', '+15550104', 2, 'WAITING', '2026-07-13 06:46:21.524'),
('ba551b59-3dd9-4962-b5cd-5cfbff7e8f20', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', 'Riley Gomez', '+15550104', 2, 'WAITING', '2026-07-13 06:46:21.087'),
('dae02254-ae38-4755-9a4f-2cbcd57732cf', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Riley Gomez', '+15550104', 2, 'WAITING', '2026-07-13 06:46:20.916'),
('dcea6c48-be69-4b3c-9070-01c05397974b', '1986a50c-b166-4771-87df-3d37f61d66a2', 'Sam Patel', '+15550103', 3, 'WAITING', '2026-07-13 06:46:20.916'),
('dd0489a3-936c-4476-bfd0-9cd68ec1a88b', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Sam Patel', '+15550103', 3, 'WAITING', '2026-07-13 06:46:20.658'),
('e205e993-7537-4919-a622-6357769b544e', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', 'Riley Gomez', '+15550104', 2, 'WAITING', '2026-07-13 06:46:20.658'),
('e55b5427-85c4-4fad-b9c4-4ed4449e63b9', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'Sam Patel', '+15550103', 3, 'WAITING', '2026-07-13 06:46:21.524');

-- --------------------------------------------------------

--
-- Table structure for table `wastelog`
--

CREATE TABLE `wastelog` (
  `id` varchar(36) NOT NULL,
  `tenantId` varchar(36) NOT NULL,
  `branchId` varchar(36) NOT NULL,
  `ingredientId` varchar(36) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `employeeId` varchar(36) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wastelog`
--

INSERT INTO `wastelog` (`id`, `tenantId`, `branchId`, `ingredientId`, `quantity`, `cost`, `reason`, `employeeId`, `createdAt`) VALUES
('8e90cb36-4b5c-40d6-968a-42f6923c0e4e', '73abee05-a369-4ce7-af7d-cff66ed7ecbe', '2c600b63-5d71-4c2c-bc47-ac4c24b4caff', '406e51d5-0c4f-4991-9e5c-26060044f019', 1.500, 12.50, 'Prep trim / spoilage demo', '15b721bd-efde-4dd1-8e05-98bacb3d2879', '2026-07-13 06:46:21.147'),
('b40bab56-045a-4662-922e-175b610a78c8', 'a6e6f3c1-8094-47e7-a9f8-4ed3539d6333', '02721ba6-f8ad-4bb2-b1de-e3e2d11a2d8f', '07c8c471-24df-4aec-a3dc-d5fa5303b2a9', 1.500, 12.50, 'Prep trim / spoilage demo', '55bafa81-28ef-4f1c-946d-d2207efa6ff1', '2026-07-13 06:46:20.763'),
('c5863ddf-36ae-4f55-a09e-d97e730dd295', '60cfbbf7-2347-4e98-81cf-c05324ab5dc7', 'd5cb1bf2-2e90-4dfb-a4d7-33b43839c121', '0b62770a-eb8c-44e8-8006-3fea73952c89', 1.500, 12.50, 'Prep trim / spoilage demo', 'dea3cce1-10f7-42b8-b79e-c48858caabc8', '2026-07-13 06:46:21.672'),
('fc146572-3f18-401b-ae3e-f5235ddadc53', '1986a50c-b166-4771-87df-3d37f61d66a2', '6bfd9662-ca69-4e32-bddf-49e0b030a4d7', '2cf29a43-a662-4133-a240-dbebada070e8', 1.500, 12.50, 'Prep trim / spoilage demo', 'c7070bb9-d178-46c2-b474-d7896370f52f', '2026-07-13 06:46:20.977');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ActivityLog_tenantId_action_createdAt_idx` (`tenantId`,`action`,`createdAt`),
  ADD KEY `ActivityLog_userId_fkey` (`userId`);

--
-- Indexes for table `apikeyrecord`
--
ALTER TABLE `apikeyrecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ApiKeyRecord_keyPrefix_idx` (`keyPrefix`);

--
-- Indexes for table `approvalrequest`
--
ALTER TABLE `approvalrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ApprovalRequest_tenantId_status_type_idx` (`tenantId`,`status`,`type`);

--
-- Indexes for table `backuppolicy`
--
ALTER TABLE `backuppolicy`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Branch_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `coupon`
--
ALTER TABLE `coupon`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Coupon_code_key` (`code`),
  ADD KEY `Coupon_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `customerprofile`
--
ALTER TABLE `customerprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CustomerProfile_userId_key` (`userId`);

--
-- Indexes for table `deliveryjob`
--
ALTER TABLE `deliveryjob`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DeliveryJob_tenantId_status_createdAt_idx` (`tenantId`,`status`,`createdAt`);

--
-- Indexes for table `eventbooking`
--
ALTER TABLE `eventbooking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `EventBooking_tenantId_fkey` (`tenantId`),
  ADD KEY `EventBooking_branchId_fkey` (`branchId`);

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Expense_tenantId_status_createdAt_idx` (`tenantId`,`status`,`createdAt`);

--
-- Indexes for table `floor`
--
ALTER TABLE `floor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Floor_tenantId_branchId_idx` (`tenantId`,`branchId`),
  ADD KEY `Floor_branchId_fkey` (`branchId`);

--
-- Indexes for table `giftcard`
--
ALTER TABLE `giftcard`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `GiftCard_code_key` (`code`),
  ADD KEY `GiftCard_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `globaltaxsetting`
--
ALTER TABLE `globaltaxsetting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ingredient`
--
ALTER TABLE `ingredient`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Ingredient_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Invoice_tenantId_status_idx` (`tenantId`,`status`);

--
-- Indexes for table `kitchensection`
--
ALTER TABLE `kitchensection`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `KitchenSection_branchId_name_key` (`branchId`,`name`),
  ADD KEY `KitchenSection_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `leaverequest`
--
ALTER TABLE `leaverequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LeaveRequest_tenantId_userId_status_idx` (`tenantId`,`userId`,`status`);

--
-- Indexes for table `marketingcampaign`
--
ALTER TABLE `marketingcampaign`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MarketingCampaign_tenantId_status_idx` (`tenantId`,`status`);

--
-- Indexes for table `menucategory`
--
ALTER TABLE `menucategory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MenuCategory_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MenuItem_categoryId_deletedAt_idx` (`categoryId`,`deletedAt`),
  ADD KEY `MenuItem_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `menumodifier`
--
ALTER TABLE `menumodifier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MenuModifier_menuItemId_idx` (`menuItemId`),
  ADD KEY `MenuModifier_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_isRead_idx` (`userId`,`isRead`),
  ADD KEY `Notification_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `nutritioninfo`
--
ALTER TABLE `nutritioninfo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NutritionInfo_menuItemId_key` (`menuItemId`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Order_tenantId_orderNumber_key` (`tenantId`,`orderNumber`),
  ADD KEY `Order_branchId_status_idx` (`branchId`,`status`),
  ADD KEY `Order_tableId_fkey` (`tableId`),
  ADD KEY `Order_customerId_fkey` (`customerId`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_fkey` (`orderId`),
  ADD KEY `OrderItem_menuItemId_fkey` (`menuItemId`);

--
-- Indexes for table `orderitemmodifier`
--
ALTER TABLE `orderitemmodifier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItemModifier_orderItemId_fkey` (`orderItemId`),
  ADD KEY `OrderItemModifier_modifierId_fkey` (`modifierId`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Permission_scope_key` (`scope`);

--
-- Indexes for table `planfeatureflag`
--
ALTER TABLE `planfeatureflag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PlanFeatureFlag_planTier_featureKey_key` (`planTier`,`featureKey`);

--
-- Indexes for table `platformbranding`
--
ALTER TABLE `platformbranding`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `platformintegration`
--
ALTER TABLE `platformintegration`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productionbatch`
--
ALTER TABLE `productionbatch`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductionBatch_tenantId_fkey` (`tenantId`),
  ADD KEY `ProductionBatch_branchId_fkey` (`branchId`);

--
-- Indexes for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PurchaseOrder_tenantId_poNumber_key` (`tenantId`,`poNumber`),
  ADD KEY `PurchaseOrder_tenantId_status_idx` (`tenantId`,`status`),
  ADD KEY `PurchaseOrder_supplierId_fkey` (`supplierId`),
  ADD KEY `PurchaseOrder_branchId_fkey` (`branchId`);

--
-- Indexes for table `purchaseorderitem`
--
ALTER TABLE `purchaseorderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `PurchaseOrderItem_purchaseOrderId_fkey` (`purchaseOrderId`),
  ADD KEY `PurchaseOrderItem_ingredientId_fkey` (`ingredientId`);

--
-- Indexes for table `recipe`
--
ALTER TABLE `recipe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Recipe_menuItemId_ingredientId_key` (`menuItemId`,`ingredientId`),
  ADD KEY `Recipe_ingredientId_fkey` (`ingredientId`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Reservation_tenantId_fkey` (`tenantId`),
  ADD KEY `Reservation_tableId_fkey` (`tableId`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_tenantId_name_deletedAt_key` (`tenantId`,`name`,`deletedAt`),
  ADD KEY `Role_name_deletedAt_idx` (`name`,`deletedAt`);

--
-- Indexes for table `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD KEY `RolePermission_permissionId_fkey` (`permissionId`);

--
-- Indexes for table `savedreport`
--
ALTER TABLE `savedreport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SavedReport_tenantId_fkey` (`tenantId`),
  ADD KEY `SavedReport_branchId_fkey` (`branchId`),
  ADD KEY `SavedReport_createdById_fkey` (`createdById`);

--
-- Indexes for table `staffattendance`
--
ALTER TABLE `staffattendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StaffAttendance_userId_clockIn_idx` (`userId`,`clockIn`),
  ADD KEY `StaffAttendance_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `staffschedule`
--
ALTER TABLE `staffschedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StaffSchedule_tenantId_branchId_shiftDate_idx` (`tenantId`,`branchId`,`shiftDate`);

--
-- Indexes for table `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StockMovement_ingredientId_createdAt_idx` (`ingredientId`,`createdAt`),
  ADD KEY `StockMovement_tenantId_fkey` (`tenantId`),
  ADD KEY `StockMovement_branchId_fkey` (`branchId`),
  ADD KEY `StockMovement_createdById_fkey` (`createdById`);

--
-- Indexes for table `stocktransferrequest`
--
ALTER TABLE `stocktransferrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StockTransferRequest_tenantId_status_createdAt_idx` (`tenantId`,`status`,`createdAt`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Subscription_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `subscriptionplan`
--
ALTER TABLE `subscriptionplan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Supplier_tenantId_deletedAt_idx` (`tenantId`,`deletedAt`);

--
-- Indexes for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupportTicket_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `SupportTicket_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `systemannouncement`
--
ALTER TABLE `systemannouncement`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `table`
--
ALTER TABLE `table`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Table_qrToken_key` (`qrToken`),
  ADD UNIQUE KEY `Table_floorId_number_key` (`floorId`,`number`),
  ADD KEY `Table_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `tenant`
--
ALTER TABLE `tenant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Tenant_slug_key` (`slug`),
  ADD KEY `Tenant_status_deletedAt_idx` (`status`,`deletedAt`);

--
-- Indexes for table `tenantsettings`
--
ALTER TABLE `tenantsettings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TenantSettings_tenantId_key` (`tenantId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_tenantId_deletedAt_key` (`email`,`tenantId`,`deletedAt`),
  ADD KEY `User_roleId_deletedAt_idx` (`roleId`,`deletedAt`),
  ADD KEY `User_branchId_fkey` (`branchId`),
  ADD KEY `User_tenantId_email_deletedAt_idx` (`tenantId`,`email`,`deletedAt`),
  ADD KEY `User_email_deletedAt_idx` (`email`,`deletedAt`);

--
-- Indexes for table `waitinglist`
--
ALTER TABLE `waitinglist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WaitingList_tenantId_fkey` (`tenantId`);

--
-- Indexes for table `wastelog`
--
ALTER TABLE `wastelog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WasteLog_branchId_createdAt_idx` (`branchId`,`createdAt`),
  ADD KEY `WasteLog_tenantId_fkey` (`tenantId`),
  ADD KEY `WasteLog_ingredientId_fkey` (`ingredientId`),
  ADD KEY `WasteLog_employeeId_fkey` (`employeeId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD CONSTRAINT `ActivityLog_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `approvalrequest`
--
ALTER TABLE `approvalrequest`
  ADD CONSTRAINT `ApprovalRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `branch`
--
ALTER TABLE `branch`
  ADD CONSTRAINT `Branch_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `coupon`
--
ALTER TABLE `coupon`
  ADD CONSTRAINT `Coupon_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `customerprofile`
--
ALTER TABLE `customerprofile`
  ADD CONSTRAINT `CustomerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `deliveryjob`
--
ALTER TABLE `deliveryjob`
  ADD CONSTRAINT `DeliveryJob_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `eventbooking`
--
ALTER TABLE `eventbooking`
  ADD CONSTRAINT `EventBooking_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `EventBooking_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `Expense_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `floor`
--
ALTER TABLE `floor`
  ADD CONSTRAINT `Floor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Floor_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `giftcard`
--
ALTER TABLE `giftcard`
  ADD CONSTRAINT `GiftCard_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `ingredient`
--
ALTER TABLE `ingredient`
  ADD CONSTRAINT `Ingredient_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `Invoice_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `kitchensection`
--
ALTER TABLE `kitchensection`
  ADD CONSTRAINT `KitchenSection_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `KitchenSection_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `leaverequest`
--
ALTER TABLE `leaverequest`
  ADD CONSTRAINT `LeaveRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `marketingcampaign`
--
ALTER TABLE `marketingcampaign`
  ADD CONSTRAINT `MarketingCampaign_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `menucategory`
--
ALTER TABLE `menucategory`
  ADD CONSTRAINT `MenuCategory_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD CONSTRAINT `MenuItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `menucategory` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MenuItem_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `menumodifier`
--
ALTER TABLE `menumodifier`
  ADD CONSTRAINT `MenuModifier_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `MenuModifier_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `nutritioninfo`
--
ALTER TABLE `nutritioninfo`
  ADD CONSTRAINT `NutritionInfo_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `table` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `OrderItem_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orderitemmodifier`
--
ALTER TABLE `orderitemmodifier`
  ADD CONSTRAINT `OrderItemModifier_modifierId_fkey` FOREIGN KEY (`modifierId`) REFERENCES `menumodifier` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItemModifier_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `orderitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productionbatch`
--
ALTER TABLE `productionbatch`
  ADD CONSTRAINT `ProductionBatch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductionBatch_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD CONSTRAINT `PurchaseOrder_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrder_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchaseorderitem`
--
ALTER TABLE `purchaseorderitem`
  ADD CONSTRAINT `PurchaseOrderItem_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `PurchaseOrderItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseorder` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recipe`
--
ALTER TABLE `recipe`
  ADD CONSTRAINT `Recipe_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Recipe_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menuitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `Reservation_tableId_fkey` FOREIGN KEY (`tableId`) REFERENCES `table` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Reservation_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `role`
--
ALTER TABLE `role`
  ADD CONSTRAINT `Role_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `savedreport`
--
ALTER TABLE `savedreport`
  ADD CONSTRAINT `SavedReport_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `SavedReport_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `SavedReport_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `staffattendance`
--
ALTER TABLE `staffattendance`
  ADD CONSTRAINT `StaffAttendance_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `StaffAttendance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `staffschedule`
--
ALTER TABLE `staffschedule`
  ADD CONSTRAINT `StaffSchedule_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stockmovement`
--
ALTER TABLE `stockmovement`
  ADD CONSTRAINT `StockMovement_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `StockMovement_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stocktransferrequest`
--
ALTER TABLE `stocktransferrequest`
  ADD CONSTRAINT `StockTransferRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `Subscription_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `supplier`
--
ALTER TABLE `supplier`
  ADD CONSTRAINT `Supplier_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD CONSTRAINT `SupportTicket_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `table`
--
ALTER TABLE `table`
  ADD CONSTRAINT `Table_floorId_fkey` FOREIGN KEY (`floorId`) REFERENCES `floor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Table_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tenantsettings`
--
ALTER TABLE `tenantsettings`
  ADD CONSTRAINT `TenantSettings_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `User_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `waitinglist`
--
ALTER TABLE `waitinglist`
  ADD CONSTRAINT `WaitingList_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wastelog`
--
ALTER TABLE `wastelog`
  ADD CONSTRAINT `WasteLog_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `WasteLog_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `WasteLog_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `WasteLog_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
