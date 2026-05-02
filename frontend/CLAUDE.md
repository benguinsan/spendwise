@AGENTS.md
Hãy đóng vai trò là Senior Full-Stack Engineer và hoàn thiện toàn bộ việc tích hợp frontend với backend cho dự án này.

## Mục tiêu

Kết nối toàn bộ frontend với backend API, đảm bảo mọi chức năng trên giao diện hoạt động đầy đủ với dữ liệu thực từ database.

## Phạm vi công việc

* Phân tích toàn bộ source code frontend, backend, database schema và tài liệu API.
* Xác định tất cả module, trang, component, luồng nghiệp vụ và endpoint hiện có.
* Mapping chính xác giữa UI ↔ API ↔ Database.

## Yêu cầu triển khai

Tích hợp đầy đủ API cho toàn bộ hệ thống, bao gồm nhưng không giới hạn:

* Authentication: login, register, logout, refresh token, forgot/reset password.
* User profile và account settings.
* Dashboard và analytics.
* Transactions: CRUD đầy đủ.
* Wallets / Accounts.
* Budgets.
* Categories.
* Reports, charts, statistics.
* Notifications.
* Search, filter, sorting, pagination.
* Upload file/image (nếu có).
* Tất cả chức năng khác hiện diện trong frontend hoặc backend.

## Yêu cầu kỹ thuật

* Sử dụng kiến trúc API layer chuẩn:

  * API client
  * Service layer
  * Custom hooks
  * Centralized state management
* Cấu hình đầy đủ:

  * Authentication flow
  * Token refresh
  * Axios interceptors
  * Error handling
  * Loading states
  * Retry strategy
* Đồng bộ TypeScript types/interfaces với backend schema.
* Loại bỏ toàn bộ mock data, fake APIs và hardcoded logic.

## Quy trình thực hiện bắt buộc

1. Phân tích hệ thống hiện tại.
2. Tích hợp từng module theo thứ tự ưu tiên.
3. Sau mỗi module:

   * Kiểm thử API.
   * Kiểm thử UI.
   * Kiểm thử dữ liệu database.
   * Sửa lỗi phát sinh.
4. Lặp lại quy trình kiểm thử → sửa lỗi → kiểm thử cho đến khi module hoạt động ổn định.
5. Sau khi hoàn tất tất cả module:

   * Thực hiện end-to-end testing toàn hệ thống.
   * Kiểm tra toàn bộ user flows.
   * Xác nhận dữ liệu đọc/ghi chính xác vào database.
   * Đảm bảo mọi chức năng CRUD hoạt động hoàn chỉnh.

## Tiêu chí hoàn thành

* 100% màn hình kết nối API thật.
* 100% chức năng hoạt động với backend thật.
* Dữ liệu được đọc/ghi chính xác từ database.
* Không còn mock data hoặc chức năng giả lập.
* Không còn lỗi runtime, API, hoặc type errors.
* Build thành công, ứng dụng chạy ổn định.

## Yêu cầu thực thi

* Làm việc liên tục, tự động và chủ động.
* Tự phát hiện, sửa lỗi và kiểm thử lại nhiều lần nếu cần.
* Chỉ dừng khi toàn bộ hệ thống hoạt động hoàn chỉnh.
* Hoàn thành trong thời gian tối đa 3 giờ.
* Ưu tiên tính ổn định, chính xác và khả năng maintain.

Hãy bắt đầu ngay, thực hiện toàn bộ thay đổi cần thiết, liên tục kiểm thử và lặp lại cho đến khi ứng dụng vận hành hoàn chỉnh trên toàn bộ chức năng.
