# PROJECT_PANORAMA.md

## 1. 项目元数据
- 项目地址: /Users/xuanyuan/Documents/AI-Program/easytshark-online-server-java/
- 项目名称: easytshark-online-server-java
- 编程语言: Java
- 生成时间: 2026-02-27T07:48:46.014Z

## 2. 项目概要信息
基于 Spring Boot 3 开发的在线 Tshark 流量分析后端系统，提供网络协议分析、数据持久化及安全认证功能。

## 3. 项目所有文件列表
- 全量文件数: 312
- 过滤后代码文件数: 88
```text
.DS_Store
.claude/settings.local.json
.gitignore
easytshark-online-server-java.iml
logs/easytshark-online-error.2025-10-11.log
logs/easytshark-online-error.2025-10-12.log
logs/easytshark-online-error.2025-10-14.log
logs/easytshark-online-error.log
logs/easytshark-online-info.2025-10-17.log
logs/easytshark-online-info.2025-10-18.log
logs/easytshark-online-info.2025-10-19.log
logs/easytshark-online-info.2025-10-20.log
logs/easytshark-online-info.2025-10-21.log
logs/easytshark-online-info.2025-10-22.log
logs/easytshark-online-info.2025-10-23.log
logs/easytshark-online-info.2025-10-24.log
logs/easytshark-online-info.2025-10-25.log
logs/easytshark-online-info.2025-10-26.log
logs/easytshark-online-info.2025-10-27.log
logs/easytshark-online-info.2025-10-28.log
logs/easytshark-online-info.2025-10-29.log
logs/easytshark-online-info.2025-10-30.log
logs/easytshark-online-info.2025-10-31.log
logs/easytshark-online-info.2025-11-01.log
logs/easytshark-online-info.2025-11-02.log
logs/easytshark-online-info.2025-11-03.log
logs/easytshark-online-info.2025-11-04.log
logs/easytshark-online-info.2025-11-05.log
logs/easytshark-online-info.2025-11-06.log
logs/easytshark-online-info.2025-11-07.log
logs/easytshark-online-info.2025-11-08.log
logs/easytshark-online-info.2025-11-09.log
logs/easytshark-online-info.2025-11-10.log
logs/easytshark-online-info.2025-11-11.log
logs/easytshark-online-info.2025-11-12.log
logs/easytshark-online-info.2025-11-13.log
logs/easytshark-online-info.2025-11-14.log
logs/easytshark-online-info.log
logs/easytshark-online.2025-10-17.log
logs/easytshark-online.2025-10-18.log
logs/easytshark-online.2025-10-19.log
logs/easytshark-online.2025-10-20.log
logs/easytshark-online.2025-10-21.log
logs/easytshark-online.2025-10-22.log
logs/easytshark-online.2025-10-23.log
logs/easytshark-online.2025-10-24.log
logs/easytshark-online.2025-10-25.log
logs/easytshark-online.2025-10-26.log
logs/easytshark-online.2025-10-27.log
logs/easytshark-online.2025-10-28.log
logs/easytshark-online.2025-10-29.log
logs/easytshark-online.2025-10-30.log
logs/easytshark-online.2025-10-31.log
logs/easytshark-online.2025-11-01.log
logs/easytshark-online.2025-11-02.log
logs/easytshark-online.2025-11-03.log
logs/easytshark-online.2025-11-04.log
logs/easytshark-online.2025-11-05.log
logs/easytshark-online.2025-11-06.log
logs/easytshark-online.2025-11-07.log
logs/easytshark-online.2025-11-08.log
logs/easytshark-online.2025-11-09.log
logs/easytshark-online.2025-11-10.log
logs/easytshark-online.2025-11-11.log
logs/easytshark-online.2025-11-12.log
logs/easytshark-online.2025-11-13.log
logs/easytshark-online.2025-11-14.log
logs/easytshark-online.log
pom.xml
src/.DS_Store
src/main/.DS_Store
src/main/java/.DS_Store
src/main/java/com/.DS_Store
src/main/java/com/easytshark/.DS_Store
src/main/java/com/easytshark/server/.DS_Store
src/main/java/com/easytshark/server/TsharkServerApplication.java
src/main/java/com/easytshark/server/analysis/AnalysisSqliteWriter.java
src/main/java/com/easytshark/server/analysis/PacketColorUtil.java
src/main/java/com/easytshark/server/analysis/PacketTimeOrderInfoUtil.java
src/main/java/com/easytshark/server/analysis/ProtocolDescriptions.java
src/main/java/com/easytshark/server/analysis/SessionFiveTuple.java
src/main/java/com/easytshark/server/analysis/TsharkAnalyzer.java
src/main/java/com/easytshark/server/config/AppProperties.java
src/main/java/com/easytshark/server/config/ExecutorConfig.java
src/main/java/com/easytshark/server/config/RedisConfig.java
src/main/java/com/easytshark/server/config/RequestLoggingConfiguration.java
src/main/java/com/easytshark/server/config/RequestLoggingFilter.java
src/main/java/com/easytshark/server/config/WebMvcConfig.java
src/main/java/com/easytshark/server/controller/AdminController.java
src/main/java/com/easytshark/server/controller/AdminOperationLogController.java
src/main/java/com/easytshark/server/controller/AnalysisController.java
src/main/java/com/easytshark/server/controller/AuthController.java
src/main/java/com/easytshark/server/controller/FileController.java
src/main/java/com/easytshark/server/controller/GlobalExceptionHandler.java
src/main/java/com/easytshark/server/controller/MembershipController.java
src/main/java/com/easytshark/server/controller/TaskController.java
src/main/java/com/easytshark/server/controller/UserController.java
src/main/java/com/easytshark/server/domain/entity/AnalysisTask.java
src/main/java/com/easytshark/server/domain/entity/BaseEntity.java
src/main/java/com/easytshark/server/domain/entity/MembershipOrder.java
src/main/java/com/easytshark/server/domain/entity/OperationLog.java
src/main/java/com/easytshark/server/domain/entity/StoredFile.java
src/main/java/com/easytshark/server/domain/entity/User.java
src/main/java/com/easytshark/server/domain/repository/AnalysisTaskRepository.java
src/main/java/com/easytshark/server/domain/repository/MembershipOrderRepository.java
src/main/java/com/easytshark/server/domain/repository/OperationLogRepository.java
src/main/java/com/easytshark/server/domain/repository/StoredFileRepository.java
src/main/java/com/easytshark/server/domain/repository/UserRepository.java
src/main/java/com/easytshark/server/dto/AdminFileListResponse.java
src/main/java/com/easytshark/server/dto/AdminOrderListResponse.java
src/main/java/com/easytshark/server/dto/AdminTaskListResponse.java
src/main/java/com/easytshark/server/dto/AdminUserListResponse.java
src/main/java/com/easytshark/server/dto/ApiResponse.java
src/main/java/com/easytshark/server/dto/CreateMembershipOrderRequest.java
src/main/java/com/easytshark/server/dto/DashboardStatsResponse.java
src/main/java/com/easytshark/server/dto/FileResponse.java
src/main/java/com/easytshark/server/dto/LoginRequest.java
src/main/java/com/easytshark/server/dto/LoginResponse.java
src/main/java/com/easytshark/server/dto/MembershipOrderResponse.java
src/main/java/com/easytshark/server/dto/MembershipTierResponse.java
src/main/java/com/easytshark/server/dto/OperationLogResponse.java
src/main/java/com/easytshark/server/dto/PageResponse.java
src/main/java/com/easytshark/server/dto/QueryRequest.java
src/main/java/com/easytshark/server/dto/RegisterRequest.java
src/main/java/com/easytshark/server/dto/SubmitTaskRequest.java
src/main/java/com/easytshark/server/dto/TaskResponse.java
src/main/java/com/easytshark/server/dto/TimeSeriesDataPoint.java
src/main/java/com/easytshark/server/dto/UpdateProfileRequest.java
src/main/java/com/easytshark/server/dto/UserProfileResponse.java
src/main/java/com/easytshark/server/dto/WechatCallbackRequest.java
src/main/java/com/easytshark/server/security/AuthInterceptor.java
src/main/java/com/easytshark/server/security/UserContext.java
src/main/java/com/easytshark/server/security/UserPrincipal.java
src/main/java/com/easytshark/server/service/AdminFileService.java
src/main/java/com/easytshark/server/service/AdminOperationLogService.java
src/main/java/com/easytshark/server/service/AdminOrderService.java
src/main/java/com/easytshark/server/service/AdminStatsService.java
src/main/java/com/easytshark/server/service/AdminTaskService.java
src/main/java/com/easytshark/server/service/AdminUserService.java
src/main/java/com/easytshark/server/service/AnalysisExecutionService.java
src/main/java/com/easytshark/server/service/AnalysisQueryService.java
src/main/java/com/easytshark/server/service/AuthService.java
src/main/java/com/easytshark/server/service/FileRecoveryService.java
src/main/java/com/easytshark/server/service/FileService.java
src/main/java/com/easytshark/server/service/IpLocationService.java
src/main/java/com/easytshark/server/service/JwtService.java
src/main/java/com/easytshark/server/service/MembershipOrderService.java
src/main/java/com/easytshark/server/service/MembershipService.java
src/main/java/com/easytshark/server/service/OperationLogService.java
src/main/java/com/easytshark/server/service/PacketCacheService.java
src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java
src/main/java/com/easytshark/server/service/TaskService.java
src/main/java/com/easytshark/server/service/TsharkDetailService.java
src/main/java/com/easytshark/server/service/UserService.java
src/main/java/com/easytshark/server/service/WechatPayService.java
src/main/java/com/easytshark/server/service/WechatService.java
src/main/java/com/easytshark/server/storage/ObjectStorageService.java
src/main/java/com/easytshark/server/storage/OssStorageService.java
src/main/java/com/easytshark/server/task/DailyUsageResetTask.java
src/main/java/com/easytshark/server/task/FileCleanupScheduler.java
src/main/java/com/easytshark/server/task/MembershipExpirationTask.java
src/main/java/com/easytshark/server/task/TaskConsumer.java
src/main/java/com/easytshark/server/task/TaskQueueService.java
src/main/resources/application-server.yml
src/main/resources/application.yml
src/main/resources/ip2region.xdb
src/main/resources/logback-spring.xml
target/classes/application-server.yml
target/classes/application.yml
target/classes/com/easytshark/server/TsharkServerApplication.class
target/classes/com/easytshark/server/analysis/AnalysisSqliteWriter$IpAggregate.class
target/classes/com/easytshark/server/analysis/AnalysisSqliteWriter$PacketRecord.class
target/classes/com/easytshark/server/analysis/AnalysisSqliteWriter$ProtocolAggregate.class
target/classes/com/easytshark/server/analysis/AnalysisSqliteWriter$SessionAggregate.class
target/classes/com/easytshark/server/analysis/AnalysisSqliteWriter.class
target/classes/com/easytshark/server/analysis/PacketColorUtil.class
target/classes/com/easytshark/server/analysis/PacketTimeOrderInfoUtil.class
target/classes/com/easytshark/server/analysis/ProtocolDescriptions.class
target/classes/com/easytshark/server/analysis/SessionFiveTuple.class
target/classes/com/easytshark/server/analysis/TsharkAnalyzer.class
target/classes/com/easytshark/server/config/AppProperties$AdminProperties.class
target/classes/com/easytshark/server/config/AppProperties$AnalysisProperties.class
target/classes/com/easytshark/server/config/AppProperties$JwtProperties.class
target/classes/com/easytshark/server/config/AppProperties$MembershipProperties.class
target/classes/com/easytshark/server/config/AppProperties$StorageProperties.class
target/classes/com/easytshark/server/config/AppProperties$TierProperties.class
target/classes/com/easytshark/server/config/AppProperties$WechatPayProperties.class
target/classes/com/easytshark/server/config/AppProperties$WechatProperties.class
target/classes/com/easytshark/server/config/AppProperties.class
target/classes/com/easytshark/server/config/ExecutorConfig.class
target/classes/com/easytshark/server/config/RedisConfig.class
target/classes/com/easytshark/server/config/RequestLoggingConfiguration.class
target/classes/com/easytshark/server/config/RequestLoggingFilter.class
target/classes/com/easytshark/server/config/WebMvcConfig.class
target/classes/com/easytshark/server/controller/AdminController.class
target/classes/com/easytshark/server/controller/AdminOperationLogController.class
target/classes/com/easytshark/server/controller/AnalysisController.class
target/classes/com/easytshark/server/controller/AuthController.class
target/classes/com/easytshark/server/controller/FileController.class
target/classes/com/easytshark/server/controller/GlobalExceptionHandler.class
target/classes/com/easytshark/server/controller/MembershipController.class
target/classes/com/easytshark/server/controller/TaskController.class
target/classes/com/easytshark/server/controller/UserController.class
target/classes/com/easytshark/server/domain/entity/AnalysisTask$TaskSource.class
target/classes/com/easytshark/server/domain/entity/AnalysisTask$TaskStatus.class
target/classes/com/easytshark/server/domain/entity/AnalysisTask.class
target/classes/com/easytshark/server/domain/entity/BaseEntity.class
target/classes/com/easytshark/server/domain/entity/MembershipOrder$OrderStatus.class
target/classes/com/easytshark/server/domain/entity/MembershipOrder.class
target/classes/com/easytshark/server/domain/entity/OperationLog$OperationResult.class
target/classes/com/easytshark/server/domain/entity/OperationLog$OperationType.class
target/classes/com/easytshark/server/domain/entity/OperationLog.class
target/classes/com/easytshark/server/domain/entity/StoredFile.class
target/classes/com/easytshark/server/domain/entity/User$MembershipType.class
target/classes/com/easytshark/server/domain/entity/User$UserStatus.class
target/classes/com/easytshark/server/domain/entity/User.class
target/classes/com/easytshark/server/domain/repository/AnalysisTaskRepository.class
target/classes/com/easytshark/server/domain/repository/MembershipOrderRepository.class
target/classes/com/easytshark/server/domain/repository/OperationLogRepository.class
target/classes/com/easytshark/server/domain/repository/StoredFileRepository.class
target/classes/com/easytshark/server/domain/repository/UserRepository.class
target/classes/com/easytshark/server/dto/AdminFileListResponse$AdminFileListResponseBuilder.class
target/classes/com/easytshark/server/dto/AdminFileListResponse.class
target/classes/com/easytshark/server/dto/AdminOrderListResponse$AdminOrderListResponseBuilder.class
target/classes/com/easytshark/server/dto/AdminOrderListResponse.class
target/classes/com/easytshark/server/dto/AdminTaskListResponse$AdminTaskListResponseBuilder.class
target/classes/com/easytshark/server/dto/AdminTaskListResponse.class
target/classes/com/easytshark/server/dto/AdminUserListResponse$AdminUserListResponseBuilder.class
target/classes/com/easytshark/server/dto/AdminUserListResponse.class
target/classes/com/easytshark/server/dto/ApiResponse$ApiResponseBuilder.class
target/classes/com/easytshark/server/dto/ApiResponse.class
target/classes/com/easytshark/server/dto/CreateMembershipOrderRequest.class
target/classes/com/easytshark/server/dto/DashboardStatsResponse$DashboardStatsResponseBuilder.class
target/classes/com/easytshark/server/dto/DashboardStatsResponse.class
target/classes/com/easytshark/server/dto/FileResponse$FileResponseBuilder.class
target/classes/com/easytshark/server/dto/FileResponse.class
target/classes/com/easytshark/server/dto/LoginRequest.class
target/classes/com/easytshark/server/dto/LoginResponse$LoginResponseBuilder.class
target/classes/com/easytshark/server/dto/LoginResponse.class
target/classes/com/easytshark/server/dto/MembershipOrderResponse$MembershipOrderResponseBuilder.class
target/classes/com/easytshark/server/dto/MembershipOrderResponse.class
target/classes/com/easytshark/server/dto/MembershipTierResponse$MembershipTierResponseBuilder.class
target/classes/com/easytshark/server/dto/MembershipTierResponse.class
target/classes/com/easytshark/server/dto/OperationLogResponse$OperationLogResponseBuilder.class
target/classes/com/easytshark/server/dto/OperationLogResponse.class
target/classes/com/easytshark/server/dto/PageResponse$PageResponseBuilder.class
target/classes/com/easytshark/server/dto/PageResponse.class
target/classes/com/easytshark/server/dto/QueryRequest.class
target/classes/com/easytshark/server/dto/RegisterRequest.class
target/classes/com/easytshark/server/dto/SubmitTaskRequest.class
target/classes/com/easytshark/server/dto/TaskResponse$TaskResponseBuilder.class
target/classes/com/easytshark/server/dto/TaskResponse.class
target/classes/com/easytshark/server/dto/TimeSeriesDataPoint$TimeSeriesDataPointBuilder.class
target/classes/com/easytshark/server/dto/TimeSeriesDataPoint.class
target/classes/com/easytshark/server/dto/UpdateProfileRequest.class
target/classes/com/easytshark/server/dto/UserProfileResponse$UserProfileResponseBuilder.class
target/classes/com/easytshark/server/dto/UserProfileResponse.class
target/classes/com/easytshark/server/dto/WechatCallbackRequest.class
target/classes/com/easytshark/server/security/AuthInterceptor.class
target/classes/com/easytshark/server/security/UserContext.class
target/classes/com/easytshark/server/security/UserPrincipal.class
target/classes/com/easytshark/server/service/AdminFileService.class
target/classes/com/easytshark/server/service/AdminOperationLogService.class
target/classes/com/easytshark/server/service/AdminOrderService.class
target/classes/com/easytshark/server/service/AdminStatsService.class
target/classes/com/easytshark/server/service/AdminTaskService.class
target/classes/com/easytshark/server/service/AdminUserService.class
target/classes/com/easytshark/server/service/AnalysisExecutionService$AnalysisResult.class
target/classes/com/easytshark/server/service/AnalysisExecutionService.class
target/classes/com/easytshark/server/service/AnalysisQueryService.class
target/classes/com/easytshark/server/service/AuthService.class
target/classes/com/easytshark/server/service/FileRecoveryService.class
target/classes/com/easytshark/server/service/FileService.class
target/classes/com/easytshark/server/service/IpLocationService.class
target/classes/com/easytshark/server/service/JwtService.class
target/classes/com/easytshark/server/service/MembershipOrderService$1.class
target/classes/com/easytshark/server/service/MembershipOrderService.class
target/classes/com/easytshark/server/service/MembershipService$1.class
target/classes/com/easytshark/server/service/MembershipService$MembershipTierConfig$MembershipTierConfigBuilder.class
target/classes/com/easytshark/server/service/MembershipService$MembershipTierConfig.class
target/classes/com/easytshark/server/service/MembershipService.class
target/classes/com/easytshark/server/service/OperationLogService.class
target/classes/com/easytshark/server/service/PacketCacheService$1.class
target/classes/com/easytshark/server/service/PacketCacheService$PacketDetailData.class
target/classes/com/easytshark/server/service/PacketCacheService.class
target/classes/com/easytshark/server/service/ProtocolTreeTranslator.class
target/classes/com/easytshark/server/service/TaskService$1.class
target/classes/com/easytshark/server/service/TaskService.class
target/classes/com/easytshark/server/service/TsharkDetailService$PacketFileInfo.class
target/classes/com/easytshark/server/service/TsharkDetailService.class
target/classes/com/easytshark/server/service/UserService.class
target/classes/com/easytshark/server/service/WechatPayService$NativeOrderResult.class
target/classes/com/easytshark/server/service/WechatPayService$PaymentNotification.class
target/classes/com/easytshark/server/service/WechatPayService.class
target/classes/com/easytshark/server/service/WechatService.class
target/classes/com/easytshark/server/storage/ObjectStorageService.class
target/classes/com/easytshark/server/storage/OssStorageService.class
target/classes/com/easytshark/server/task/DailyUsageResetTask.class
target/classes/com/easytshark/server/task/FileCleanupScheduler.class
target/classes/com/easytshark/server/task/MembershipExpirationTask.class
target/classes/com/easytshark/server/task/TaskConsumer.class
target/classes/com/easytshark/server/task/TaskQueueService.class
target/classes/ip2region.xdb
target/classes/logback-spring.xml
target/classes/main/resources/application-server.yml
target/classes/main/resources/application.yml
target/classes/main/resources/ip2region.xdb
target/classes/main/resources/logback-spring.xml
target/easytshark-online-server-java-0.1.0.jar.original
target/maven-archiver/pom.properties
target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst
target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst
```

## 4. 函数调用链（JSON）
```json
{
  "maxDepth": 2,
  "entryPoint": "src/main/java/com/easytshark/server/TsharkServerApplication.java",
  "records": [
    {
      "nodeId": "n_0_1_root_main",
      "functionName": "main",
      "file": "src/main/java/com/easytshark/server/TsharkServerApplication.java",
      "line": 11,
      "depth": 0,
      "drillFlag": 1,
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/TsharkServerApplication.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/TsharkServerApplication.java:L11"
      ]
    },
    {
      "nodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "functionName": "SpringApplication.run",
      "file": "org.springframework.boot.SpringApplication",
      "depth": 1,
      "drillFlag": 1,
      "parentNodeId": "n_0_1_root_main",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): org.springframework.boot.SpringApplication",
        "step1-猜测文件-未命中(已扫描1个文件)",
        "step1b-同文件兜底-候选(1): src/main/java/com/easytshark/server/TsharkServerApplication.java",
        "step1b-同文件兜底-未命中(已扫描1个文件)",
        "step2-AI基于文件列表猜测Top3",
        "step2-命中系统/库函数标记: SpringApplication.run 是 Spring Boot 框架提供的标准库函数，用于启动 Spring 应用实例。"
      ]
    },
    {
      "nodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "functionName": "AdminController.adminLogin",
      "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
      "line": 52,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L52"
      ]
    },
    {
      "nodeId": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
      "functionName": "AdminController.adminLogout",
      "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
      "line": 101,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L101"
      ]
    },
    {
      "nodeId": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
      "functionName": "AdminController.getDashboardStats",
      "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
      "line": 113,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L113"
      ]
    },
    {
      "nodeId": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
      "functionName": "AnalysisController.protocols",
      "file": "src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "step1-猜测文件-未命中(已扫描1个文件)",
        "step1b-同文件兜底-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "step1b-同文件兜底-未命中(已扫描1个文件)",
        "step2-AI基于文件列表猜测Top3",
        "step2-AI返回候选: src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java (原因: 目标函数 AnalysisController.protocols 明确指向 AnalysisController 类，该类极可能包含此接口定义，同时逻辑可能涉及协议查询或解析服务。)",
        "step2-AI猜测Top3校验-候选(3): src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java",
        "step2-AI猜测Top3校验-未命中(已扫描3个文件)",
        "step2b-AI候选文件内容兜底定位-提交AI兜底定位(候选3个)",
        "step2b-AI候选文件内容兜底定位-AI兜底命中: src/main/java/com/easytshark/server/controller/AnalysisController.java (在 AnalysisController 类中找到了名为 protocols 的方法定义，该方法通过 @PostMapping(\"/{taskId}/protocols\") 注解对外提供服务。)"
      ]
    },
    {
      "nodeId": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
      "functionName": "AnalysisController.packetStats",
      "file": "src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "step1-猜测文件-未命中(已扫描1个文件)",
        "step1b-同文件兜底-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "step1b-同文件兜底-未命中(已扫描1个文件)",
        "step2-AI基于文件列表猜测Top3",
        "step2-AI返回候选: src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/AdminStatsService.java (原因: 目标函数带有 AnalysisController 前缀，极大概率定义在该 Controller 类中，或由其调用的相关分析服务类中。)",
        "step2-AI猜测Top3校验-候选(3): src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/AdminStatsService.java",
        "step2-AI猜测Top3校验-未命中(已扫描3个文件)",
        "step2b-AI候选文件内容兜底定位-提交AI兜底定位(候选3个)",
        "step2b-AI候选文件内容兜底定位-AI兜底命中: src/main/java/com/easytshark/server/controller/AnalysisController.java (目标函数 AnalysisController.packetStats 在 src/main/java/com/easytshark/server/controller/AnalysisController.java 文件中定义，使用了 @PostMapping 注解。)"
      ]
    },
    {
      "nodeId": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
      "functionName": "AuthController.wechatCallback",
      "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
      "line": 43,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L43"
      ]
    },
    {
      "nodeId": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
      "functionName": "AuthController.login",
      "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
      "line": 57,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L57"
      ]
    },
    {
      "nodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "functionName": "AuthController.updateProfile",
      "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
      "line": 71,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L71"
      ]
    },
    {
      "nodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "functionName": "AuthController.logout",
      "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
      "line": 87,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L87"
      ]
    },
    {
      "nodeId": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
      "functionName": "FileController.list",
      "file": "src/main/java/com/easytshark/server/controller/FileController.java",
      "line": 32,
      "depth": 2,
      "drillFlag": 1,
      "parentNodeId": "n_1_2_n_0_1_root_main_springapplication-run",
      "status": "done",
      "locateAttempts": [
        "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/FileController.java",
        "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/FileController.java:L32"
      ]
    },
    {
      "nodeId": "n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin",
      "functionName": "appProperties.getAdmin",
      "file": "src/main/java/com/easytshark/server/config/AppProperties.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure",
      "functionName": "operationLogService.logFailure",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "status": "queued"
    },
    {
      "nodeId": "n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken",
      "functionName": "jwtService.generateToken",
      "file": "src/main/java/com/easytshark/server/service/JwtService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "status": "queued"
    },
    {
      "nodeId": "n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess",
      "functionName": "operationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "status": "queued"
    },
    {
      "nodeId": "n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin",
      "functionName": "AppProperties.getAdmin",
      "file": "src/main/java/com/easytshark/server/config/AppProperties.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess",
      "functionName": "OperationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
      "status": "queued"
    },
    {
      "nodeId": "n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats",
      "functionName": "adminStatsService.getDashboardStats",
      "file": "src/main/java/com/easytshark/server/service/AdminStatsService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
      "status": "queued"
    },
    {
      "nodeId": "n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats",
      "functionName": "AnalysisQueryService.protocolStats",
      "file": "src/main/java/com/easytshark/server/service/AnalysisQueryService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
      "status": "queued"
    },
    {
      "nodeId": "n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats",
      "functionName": "AnalysisQueryService.getPacketStats",
      "file": "src/main/java/com/easytshark/server/service/AnalysisQueryService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
      "status": "queued"
    },
    {
      "nodeId": "n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat",
      "functionName": "wechatService.loginWithWechat",
      "file": "src/main/java/com/easytshark/server/service/WechatService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
      "status": "queued"
    },
    {
      "nodeId": "n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess",
      "functionName": "operationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure",
      "functionName": "operationLogService.logFailure",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login",
      "functionName": "authService.login",
      "file": "src/main/java/com/easytshark/server/service/AuthService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
      "status": "queued"
    },
    {
      "nodeId": "n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess",
      "functionName": "operationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
      "status": "queued"
    },
    {
      "nodeId": "n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure",
      "functionName": "operationLogService.logFailure",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
      "status": "queued"
    },
    {
      "nodeId": "n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser",
      "functionName": "userService.currentUser",
      "file": "src/main/java/com/easytshark/server/service/UserService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "status": "queued"
    },
    {
      "nodeId": "n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile",
      "functionName": "userService.updateProfile",
      "file": "src/main/java/com/easytshark/server/service/UserService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "status": "queued"
    },
    {
      "nodeId": "n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess",
      "functionName": "operationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "status": "queued"
    },
    {
      "nodeId": "n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile",
      "functionName": "userService.profile",
      "file": "src/main/java/com/easytshark/server/service/UserService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "status": "queued"
    },
    {
      "nodeId": "n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure",
      "functionName": "operationLogService.logFailure",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
      "status": "queued"
    },
    {
      "nodeId": "n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken",
      "functionName": "extractToken",
      "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse",
      "functionName": "jwtService.parse",
      "file": "src/main/java/com/easytshark/server/service/JwtService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "status": "queued"
    },
    {
      "nodeId": "n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid",
      "functionName": "userRepository.findById",
      "file": "src/main/java/com/easytshark/server/domain/repository/UserRepository.java",
      "depth": 3,
      "drillFlag": 0,
      "parentNodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "status": "queued"
    },
    {
      "nodeId": "n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess",
      "functionName": "operationLogService.logSuccess",
      "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "status": "queued"
    },
    {
      "nodeId": "n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
      "status": "skipped"
    },
    {
      "nodeId": "n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser",
      "functionName": "UserService.currentUser",
      "file": "src/main/java/com/easytshark/server/service/UserService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
      "status": "queued"
    },
    {
      "nodeId": "n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles",
      "functionName": "FileService.listFiles",
      "file": "src/main/java/com/easytshark/server/service/FileService.java",
      "depth": 3,
      "drillFlag": 1,
      "parentNodeId": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
      "status": "queued"
    },
    {
      "nodeId": "n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success",
      "functionName": "ApiResponse.success",
      "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
      "depth": 3,
      "drillFlag": -1,
      "parentNodeId": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
      "status": "skipped"
    }
  ],
  "graph": {
    "nodes": [
      {
        "id": "n_0_1_root_main",
        "label": "main",
        "file": "src/main/java/com/easytshark/server/TsharkServerApplication.java",
        "line": 11,
        "depth": 0,
        "description": "项目主程序入口，负责引导 Spring Boot 应用程序的启动与初始化"
      },
      {
        "id": "n_1_2_n_0_1_root_main_springapplication-run",
        "label": "SpringApplication.run",
        "file": "org.springframework.boot.SpringApplication",
        "depth": 1,
        "description": "框架桥接节点（Java Spring Boot 框架桥接：SpringApplication.run 是 Spring Boot 框架提供的标准库函数，用于启动 Spring 应用实例。），已切换到项目业务入口继续下钻"
      },
      {
        "id": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "label": "AdminController.adminLogin",
        "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
        "line": 52,
        "depth": 2,
        "description": "处理管理员登录请求，验证配置文件中的静态凭据，记录操作日志并生成 JWT 令牌。",
        "httpMethod": "POST",
        "httpRoute": "/login"
      },
      {
        "id": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
        "label": "AdminController.adminLogout",
        "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
        "line": 101,
        "depth": 2,
        "description": "处理管理员登出请求，记录登出日志并返回成功响应",
        "httpMethod": "POST",
        "httpRoute": "/logout"
      },
      {
        "id": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
        "label": "AdminController.getDashboardStats",
        "file": "src/main/java/com/easytshark/server/controller/AdminController.java",
        "line": 113,
        "depth": 2,
        "description": "处理管理员仪表盘统计数据的 GET 请求，返回系统整体运行指标的统计快照。",
        "httpMethod": "GET",
        "httpRoute": "/stats/dashboard"
      },
      {
        "id": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
        "label": "AnalysisController.protocols",
        "file": "src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "depth": 2,
        "description": "处理获取协议统计信息的 HTTP POST 请求，通过任务 ID 查询协议分布情况。",
        "httpMethod": "POST"
      },
      {
        "id": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
        "label": "AnalysisController.packetStats",
        "file": "src/main/java/com/easytshark/server/controller/AnalysisController.java",
        "depth": 2,
        "description": "处理获取数据包统计信息的接口请求，根据任务ID返回整体流量统计数据",
        "httpMethod": "GET"
      },
      {
        "id": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
        "label": "AuthController.wechatCallback",
        "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
        "line": 43,
        "depth": 2,
        "description": "接收微信回调 code，执行微信授权登录并记录操作日志",
        "httpMethod": "POST",
        "httpRoute": "/wechat/callback"
      },
      {
        "id": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
        "label": "AuthController.login",
        "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
        "line": 57,
        "depth": 2,
        "description": "处理用户登录请求，执行身份认证并记录操作日志",
        "httpMethod": "POST",
        "httpRoute": "/login"
      },
      {
        "id": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "label": "AuthController.updateProfile",
        "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
        "line": 71,
        "depth": 2,
        "description": "更新当前登录用户的个人资料，并记录成功的操作日志或失败异常。",
        "httpMethod": "PUT",
        "httpRoute": "/profile"
      },
      {
        "id": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "label": "AuthController.logout",
        "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
        "line": 87,
        "depth": 2,
        "description": "处理用户注销请求，解析令牌并记录操作日志",
        "httpMethod": "POST",
        "httpRoute": "/logout"
      },
      {
        "id": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
        "label": "FileController.list",
        "file": "src/main/java/com/easytshark/server/controller/FileController.java",
        "line": 32,
        "depth": 2,
        "description": "处理获取文件列表请求，获取当前用户身份并查询其名下的所有文件。",
        "httpMethod": "GET"
      },
      {
        "id": "n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin",
        "label": "appProperties.getAdmin",
        "file": "src/main/java/com/easytshark/server/config/AppProperties.java",
        "depth": 3,
        "description": "从配置中获取预设的管理员用户名和密码"
      },
      {
        "id": "n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure",
        "label": "operationLogService.logFailure",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录登录失败的操作日志，包括错误信息和请求上下文"
      },
      {
        "id": "n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken",
        "label": "jwtService.generateToken",
        "file": "src/main/java/com/easytshark/server/service/JwtService.java",
        "depth": 3,
        "description": "根据管理员 UUID 和身份信息生成 JWT 访问令牌"
      },
      {
        "id": "n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess",
        "label": "operationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录登录成功的操作日志"
      },
      {
        "id": "n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "封装并返回包含登录结果的响应体"
      },
      {
        "id": "n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin",
        "label": "AppProperties.getAdmin",
        "file": "src/main/java/com/easytshark/server/config/AppProperties.java",
        "depth": 3,
        "description": "获取配置文件中的管理员账户信息"
      },
      {
        "id": "n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess",
        "label": "OperationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录成功的操作日志（登出事件）"
      },
      {
        "id": "n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "构建成功的 API 响应对象"
      },
      {
        "id": "n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats",
        "label": "adminStatsService.getDashboardStats",
        "file": "src/main/java/com/easytshark/server/service/AdminStatsService.java",
        "depth": 3,
        "description": "调用统计服务获取汇总数据"
      },
      {
        "id": "n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "封装成功响应对象"
      },
      {
        "id": "n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats",
        "label": "AnalysisQueryService.protocolStats",
        "file": "src/main/java/com/easytshark/server/service/AnalysisQueryService.java",
        "depth": 3,
        "description": "核心业务逻辑，执行数据库或内存中的协议统计分析。"
      },
      {
        "id": "n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "封装通用的 API 成功响应结构。"
      },
      {
        "id": "n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats",
        "label": "AnalysisQueryService.getPacketStats",
        "file": "src/main/java/com/easytshark/server/service/AnalysisQueryService.java",
        "depth": 3,
        "description": "查询并生成指定任务的数据包统计分析结果"
      },
      {
        "id": "n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "构造成功响应的 DTO 对象"
      },
      {
        "id": "n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat",
        "label": "wechatService.loginWithWechat",
        "file": "src/main/java/com/easytshark/server/service/WechatService.java",
        "depth": 3,
        "description": "核心登录逻辑：使用 code 换取微信用户信息并生成 JWT 令牌"
      },
      {
        "id": "n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess",
        "label": "operationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录用户成功登录的审计日志"
      },
      {
        "id": "n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure",
        "label": "operationLogService.logFailure",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录登录失败的异常日志"
      },
      {
        "id": "n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "构造标准成功响应包装类"
      },
      {
        "id": "n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login",
        "label": "authService.login",
        "file": "src/main/java/com/easytshark/server/service/AuthService.java",
        "depth": 3,
        "description": "执行核心登录验证逻辑，包括凭据校验和令牌生成"
      },
      {
        "id": "n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess",
        "label": "operationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录成功的登录审计日志"
      },
      {
        "id": "n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure",
        "label": "operationLogService.logFailure",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录登录失败的异常信息与审计日志"
      },
      {
        "id": "n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "封装标准 API 成功返回结果"
      },
      {
        "id": "n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser",
        "label": "userService.currentUser",
        "file": "src/main/java/com/easytshark/server/service/UserService.java",
        "depth": 3,
        "description": "从安全上下文中获取当前登录用户实体"
      },
      {
        "id": "n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile",
        "label": "userService.updateProfile",
        "file": "src/main/java/com/easytshark/server/service/UserService.java",
        "depth": 3,
        "description": "执行用户资料更新的具体业务逻辑"
      },
      {
        "id": "n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess",
        "label": "operationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录成功的操作审计日志"
      },
      {
        "id": "n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile",
        "label": "userService.profile",
        "file": "src/main/java/com/easytshark/server/service/UserService.java",
        "depth": 3,
        "description": "将用户实体对象包装为返回给前端的 Profile DTO"
      },
      {
        "id": "n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure",
        "label": "operationLogService.logFailure",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "捕获异常并记录失败的操作日志"
      },
      {
        "id": "n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken",
        "label": "extractToken",
        "file": "src/main/java/com/easytshark/server/controller/AuthController.java",
        "depth": 3,
        "description": "从 HttpServletRequest 的 Authorization 头中提取 Bearer 令牌"
      },
      {
        "id": "n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse",
        "label": "jwtService.parse",
        "file": "src/main/java/com/easytshark/server/service/JwtService.java",
        "depth": 3,
        "description": "解析 JWT 令牌以获取包含用户 ID 的 Claims"
      },
      {
        "id": "n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid",
        "label": "userRepository.findById",
        "file": "src/main/java/com/easytshark/server/domain/repository/UserRepository.java",
        "depth": 3,
        "description": "根据用户 ID 从数据库查询用户信息以获取用户名"
      },
      {
        "id": "n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess",
        "label": "operationLogService.logSuccess",
        "file": "src/main/java/com/easytshark/server/service/OperationLogService.java",
        "depth": 3,
        "description": "记录注销成功的操作日志"
      },
      {
        "id": "n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "返回标准成功响应对象"
      },
      {
        "id": "n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser",
        "label": "UserService.currentUser",
        "file": "src/main/java/com/easytshark/server/service/UserService.java",
        "depth": 3,
        "description": "获取当前认证登录的用户对象"
      },
      {
        "id": "n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles",
        "label": "FileService.listFiles",
        "file": "src/main/java/com/easytshark/server/service/FileService.java",
        "depth": 3,
        "description": "根据用户信息查询并返回文件列表"
      },
      {
        "id": "n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success",
        "label": "ApiResponse.success",
        "file": "src/main/java/com/easytshark/server/dto/ApiResponse.java",
        "depth": 3,
        "description": "构造成功的统一响应格式"
      }
    ],
    "edges": [
      {
        "source": "n_0_1_root_main",
        "target": "n_1_2_n_0_1_root_main_springapplication-run"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout"
      },
      {
        "source": "n_1_2_n_0_1_root_main_springapplication-run",
        "target": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list"
      },
      {
        "source": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "target": "n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin"
      },
      {
        "source": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "target": "n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure"
      },
      {
        "source": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "target": "n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken"
      },
      {
        "source": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "target": "n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin",
        "target": "n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success"
      },
      {
        "source": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
        "target": "n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin"
      },
      {
        "source": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
        "target": "n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout",
        "target": "n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success"
      },
      {
        "source": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
        "target": "n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats"
      },
      {
        "source": "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats",
        "target": "n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success"
      },
      {
        "source": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
        "target": "n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats"
      },
      {
        "source": "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols",
        "target": "n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success"
      },
      {
        "source": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
        "target": "n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats"
      },
      {
        "source": "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats",
        "target": "n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success"
      },
      {
        "source": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
        "target": "n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat"
      },
      {
        "source": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
        "target": "n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
        "target": "n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure"
      },
      {
        "source": "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback",
        "target": "n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success"
      },
      {
        "source": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
        "target": "n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login"
      },
      {
        "source": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
        "target": "n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
        "target": "n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure"
      },
      {
        "source": "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login",
        "target": "n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success"
      },
      {
        "source": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "target": "n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser"
      },
      {
        "source": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "target": "n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile"
      },
      {
        "source": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "target": "n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "target": "n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile"
      },
      {
        "source": "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile",
        "target": "n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure"
      },
      {
        "source": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "target": "n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken"
      },
      {
        "source": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "target": "n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse"
      },
      {
        "source": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "target": "n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid"
      },
      {
        "source": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "target": "n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess"
      },
      {
        "source": "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout",
        "target": "n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success"
      },
      {
        "source": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
        "target": "n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser"
      },
      {
        "source": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
        "target": "n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles"
      },
      {
        "source": "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list",
        "target": "n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success"
      }
    ]
  }
}
```

## 5. Agent 状态日志
```json
[
  {
    "id": "v3qltp",
    "timestamp": 1772178525251,
    "message": "正在验证本地目录: /Users/xuanyuan/Documents/AI-Program/easytshark-online-server-java/",
    "type": "info"
  },
  {
    "id": "wlx8cu",
    "timestamp": 1772178525845,
    "message": "本地目录验证成功",
    "type": "success"
  },
  {
    "id": "mmr1z",
    "timestamp": 1772178525846,
    "message": "正在获取文件结构...",
    "type": "info"
  },
  {
    "id": "y25zv",
    "timestamp": 1772178526014,
    "message": "成功获取 312 个文件（代码文件 88）",
    "type": "success"
  },
  {
    "id": "rzebpw",
    "timestamp": 1772178526015,
    "message": "AI Agent: 正在识别主入口文件与入口函数（逐步下钻模式）...",
    "type": "thinking"
  },
  {
    "id": "31qi4w",
    "timestamp": 1772178537145,
    "message": "AI 调用完成：入口识别：候选入口文件与主入口函数",
    "type": "thinking",
    "aiTrace": {
      "label": "入口识别：候选入口文件与主入口函数",
      "request": "{\n  \"prompt\": \"\\n你是一位资深软件架构师。下面是项目代码文件列表，请识别主要语言、可能入口文件和主入口函数名称（如果能推断）。\\n\\n代码文件列表：\\n[\\\"src/main/java/com/easytshark/server/TsharkServerApplication.java\\\",\\\"src/main/java/com/easytshark/server/analysis/AnalysisSqliteWriter.java\\\",\\\"src/main/java/com/easytshark/server/analysis/PacketColorUtil.java\\\",\\\"src/main/java/com/easytshark/server/analysis/PacketTimeOrderInfoUtil.java\\\",\\\"src/main/java/com/easytshark/server/analysis/ProtocolDescriptions.java\\\",\\\"src/main/java/com/easytshark/server/analysis/SessionFiveTuple.java\\\",\\\"src/main/java/com/easytshark/server/analysis/TsharkAnalyzer.java\\\",\\\"src/main/java/com/easytshark/server/config/AppProperties.java\\\",\\\"src/main/java/com/easytshark/server/config/ExecutorCon ...[还有 5664 字节]\"\n}",
      "response": "{\n  \"language\": \"Java\",\n  \"potentialEntryPoints\": [\n    \"src/main/java/com/easytshark/server/TsharkServerApplication.java\"\n  ],\n  \"potentialEntryFunctionNames\": [\n    \"main\"\n  ]\n}"
    }
  },
  {
    "id": "d6gq2l",
    "timestamp": 1772178537145,
    "message": "识别语言: Java",
    "type": "info"
  },
  {
    "id": "7xcvpvh",
    "timestamp": 1772178537145,
    "message": "候选入口文件: src/main/java/com/easytshark/server/TsharkServerApplication.java",
    "type": "info"
  },
  {
    "id": "gai8o3",
    "timestamp": 1772178544946,
    "message": "AI 调用完成：入口校验: src/main/java/com/easytshark/server/TsharkServerApplication.java",
    "type": "thinking",
    "aiTrace": {
      "label": "入口校验: src/main/java/com/easytshark/server/TsharkServerApplication.java",
      "request": "{\n  \"prompt\": \"\\n你是代码入口识别器。请判断该文件是否是项目入口文件（main 启动、服务启动、React/Vue 挂载、CLI 启动等）。\\n返回 JSON。\\n\\n语言：Java\\n文件路径：src/main/java/com/easytshark/server/TsharkServerApplication.java\\n文件总行数：15\\n文件内容（按行数规则截取）：\\n- 如果文件少于 2000 行：发送全文\\n- 如果文件在 2001-4000 行：发送前 2000 行\\n- 如果文件超过 4000 行：发送前 2000 行和后 2000 行\\n以下是本次发送内容：\\npackage com.easytshark.server;\\n\\nimport org.springframework.boot.SpringApplication;\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\nimport org.springframework.scheduling.annotation.EnableScheduling;\\n\\n@SpringBootApplication\\n@EnableScheduling\\npublic class TsharkServ ...[还有 236 字节]\"\n}",
      "response": "{\n  \"isEntryPoint\": true,\n  \"entryFunctionName\": \"main\",\n  \"reason\": \"包含 @SpringBootApplication 注解并定义了调用 SpringApplication.run 的 main 方法，是典型的 Spring Boot 服务启动入口。\"\n}"
    }
  },
  {
    "id": "mjul",
    "timestamp": 1772178544946,
    "message": "验证候选入口文件: src/main/java/com/easytshark/server/TsharkServerApplication.java",
    "type": "thinking"
  },
  {
    "id": "qxr93f",
    "timestamp": 1772178544946,
    "message": "确认入口文件: src/main/java/com/easytshark/server/TsharkServerApplication.java",
    "type": "success"
  },
  {
    "id": "tz4n4p",
    "timestamp": 1772178554768,
    "message": "AI 调用完成：项目概要与技术栈生成",
    "type": "thinking",
    "aiTrace": {
      "label": "项目概要与技术栈生成",
      "request": "{\n  \"prompt\": \"\\n你是项目概要分析器。请根据 README、入口文件和清单文件，输出项目中文简介与技术栈（简洁）。\\n\\n仓库：easytshark-online-server-java\\n语言：Java\\n文件内容：{\\\"src/main/java/com/easytshark/server/TsharkServerApplication.java\\\":\\\"package com.easytshark.server;\\\\n\\\\nimport org.springframework.boot.SpringApplication;\\\\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\\\\nimport org.springframework.scheduling.annotation.EnableScheduling;\\\\n\\\\n@SpringBootApplication\\\\n@EnableScheduling\\\\npublic class TsharkServerApplication {\\\\n\\\\n    public static void main(String[] args) {\\\\n        SpringApplication.run(TsharkServerApplication.class, args);\\\\n    }\\\\n}\\\\n\\\",\\\"pom.xml\\\":\\\"<?xml version=\\\\\\\"1.0\\\\\\\" encoding=\\\\\\\"UTF-8\\\\\\\"?>\\\\n<project xmlns=\\\\\\\"http://maven.apache. ...[还有 4813 字节]\"\n}",
      "response": "{\n  \"summary\": \"基于 Spring Boot 3 开发的在线 Tshark 流量分析后端系统，提供网络协议分析、数据持久化及安全认证功能。\",\n  \"techStack\": [\n    \"Java 17\",\n    \"Spring Boot\",\n    \"Spring Data JPA\",\n    \"MySQL\",\n    \"SQLite\",\n    \"Redis\",\n    \"JWT\",\n    \"Aliyun OSS\",\n    \"Lombok\"\n  ]\n}"
    }
  },
  {
    "id": "hs39gt",
    "timestamp": 1772178554768,
    "message": "【下钻】开始逐级下钻调用链（动态渲染）...",
    "type": "thinking"
  },
  {
    "id": "fsqi8",
    "timestamp": 1772178554768,
    "message": "【下钻】下钻 L0: main()",
    "type": "thinking"
  },
  {
    "id": "9fsep",
    "timestamp": 1772178563954,
    "message": "AI 调用完成：函数下钻分析 L0: main",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L0: main",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n5. 这是入口分析步骤，请把当前函数视为主入口函数。\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并 ...[还有 1510 字节]\"\n}",
      "response": "{\n  \"functionName\": \"main\",\n  \"functionType\": \"method\",\n  \"description\": \"项目主程序入口，负责引导 Spring Boot 应用程序的启动与初始化\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"SpringApplication.run\",\n      \"type\": \"method\",\n      \"description\": \"启动 Spring 容器，执行自动配置、组件扫描并运行内嵌 Web 服务器\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"org.springframework.boot.SpringApplication\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "mdc90r",
    "timestamp": 1772178563954,
    "message": "【下钻】定位成功：main() -> src/main/java/com/easytshark/server/TsharkServerApplication.java:L11",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/TsharkServerApplication.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/TsharkServerApplication.java:L11"
    ]
  },
  {
    "id": "1jaxus",
    "timestamp": 1772178563954,
    "message": "【下钻】发现 1 个关键子调用节点: main()",
    "type": "info"
  },
  {
    "id": "p2g46",
    "timestamp": 1772178563954,
    "message": "【下钻】下钻 L1: main() -> SpringApplication.run()",
    "type": "thinking"
  },
  {
    "id": "3z5fxg",
    "timestamp": 1772178563980,
    "message": "源码拉取失败: org.springframework.boot.SpringApplication (文件不存在)",
    "type": "info"
  },
  {
    "id": "6k7v97",
    "timestamp": 1772178569707,
    "message": "AI 调用完成：函数定位猜测Top3: SpringApplication.run",
    "type": "thinking",
    "aiTrace": {
      "label": "函数定位猜测Top3: SpringApplication.run",
      "request": "{\n  \"prompt\": \"\\n你是代码定位助手。请根据函数名、调用上下文与项目代码文件列表，猜测该函数定义最可能所在的 3 个文件（仅返回项目内相对路径）。\\n如果目标函数看起来是系统函数或编程语言标准库/第三方库函数（例如 C 标准库、C++ STL、Java SDK、Node/Python 内置库等），请不要猜测项目文件，直接输出系统库标记。\\n\\n项目语言：Java\\n调用者函数：main\\n调用者文件：src/main/java/com/easytshark/server/TsharkServerApplication.java\\n目标函数：SpringApplication.run\\n代码文件列表（过滤后）：\\n[\\\"src/main/java/com/easytshark/server/TsharkServerApplication.java\\\",\\\"src/main/java/com/easytshark/server/analysis/AnalysisSqliteWriter.java\\\",\\\"src/main/java/com/easytshark/server/analysis/Packet ...[还有 6344 字节]\"\n}",
      "response": "{\n  \"isSystemOrLibraryFunction\": true,\n  \"systemOrLibraryReason\": \"SpringApplication.run 是 Spring Boot 框架提供的标准库函数，用于启动 Spring 应用实例。\",\n  \"systemOrLibraryMarker\": \"__SYSTEM_OR_LIBRARY_FUNCTION__\",\n  \"candidateFiles\": [],\n  \"reason\": \"系统或库函数\"\n}"
    }
  },
  {
    "id": "mw0g51d",
    "timestamp": 1772178569767,
    "message": "【下钻】命中框架桥接策略[java_spring_boot_runtime_bridge]: main() -> SpringApplication.run()，转入 10 个业务入口继续下钻",
    "type": "info"
  },
  {
    "id": "9kzr4d",
    "timestamp": 1772178569767,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AdminController.adminLogin()",
    "type": "thinking"
  },
  {
    "id": "ri712",
    "timestamp": 1772178585030,
    "message": "AI 调用完成：函数下钻分析 L2: AdminController.adminLogin",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AdminController.adminLogin",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 12136 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AdminController.adminLogin\",\n  \"functionType\": \"function\",\n  \"description\": \"处理管理员登录请求，验证配置文件中的静态凭据，记录操作日志并生成 JWT 令牌。\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"appProperties.getAdmin\",\n      \"type\": \"method\",\n      \"description\": \"从配置中获取预设的管理员用户名和密码\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/config/AppProperties.java\"\n    },\n    {\n      \"name\": \"operationLogService.logFailure\",\n      \"type\": \"method\",\n      \"description\": \"记录登录失败的操作日志，包括错误信息和请求上下文\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"jwtService.generateToken\",\n      \"type\": \"method\",\n      \"description\": \"根据管理员 UUID 和身份信息生成 JWT 访问令牌\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/JwtService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录登录成功的操作日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"封装并返回包含登录结果的响应体\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "iyh4oe",
    "timestamp": 1772178585030,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AdminController.adminLogin() -> src/main/java/com/easytshark/server/controller/AdminController.java:L52",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L52"
    ]
  },
  {
    "id": "4cexej",
    "timestamp": 1772178585030,
    "message": "【下钻】发现 5 个关键子调用节点: main() -> SpringApplication.run() -> AdminController.adminLogin()",
    "type": "info"
  },
  {
    "id": "t1d3en",
    "timestamp": 1772178585030,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AdminController.adminLogout()",
    "type": "thinking"
  },
  {
    "id": "ymr2j9",
    "timestamp": 1772178598180,
    "message": "AI 调用完成：函数下钻分析 L2: AdminController.adminLogout",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AdminController.adminLogout",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 12138 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AdminController.adminLogout\",\n  \"functionType\": \"method\",\n  \"description\": \"处理管理员登出请求，记录登出日志并返回成功响应\",\n  \"importance\": \"medium\",\n  \"calls\": [\n    {\n      \"name\": \"AppProperties.getAdmin\",\n      \"type\": \"method\",\n      \"description\": \"获取配置文件中的管理员账户信息\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/config/AppProperties.java\"\n    },\n    {\n      \"name\": \"OperationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录成功的操作日志（登出事件）\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"构建成功的 API 响应对象\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "pvpsil",
    "timestamp": 1772178598180,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AdminController.adminLogout() -> src/main/java/com/easytshark/server/controller/AdminController.java:L101",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L101"
    ]
  },
  {
    "id": "13vqjq",
    "timestamp": 1772178598180,
    "message": "【下钻】发现 3 个关键子调用节点: main() -> SpringApplication.run() -> AdminController.adminLogout()",
    "type": "info"
  },
  {
    "id": "18ikn",
    "timestamp": 1772178598180,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AdminController.getDashboardStats()",
    "type": "thinking"
  },
  {
    "id": "d48fqw",
    "timestamp": 1772178608365,
    "message": "AI 调用完成：函数下钻分析 L2: AdminController.getDashboardStats",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AdminController.getDashboardStats",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 12150 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AdminController.getDashboardStats\",\n  \"functionType\": \"method\",\n  \"description\": \"处理管理员仪表盘统计数据的 GET 请求，返回系统整体运行指标的统计快照。\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"adminStatsService.getDashboardStats\",\n      \"type\": \"method\",\n      \"description\": \"调用统计服务获取汇总数据\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/AdminStatsService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"封装成功响应对象\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "w8e1q",
    "timestamp": 1772178608365,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AdminController.getDashboardStats() -> src/main/java/com/easytshark/server/controller/AdminController.java:L113",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AdminController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AdminController.java:L113"
    ]
  },
  {
    "id": "e1hcyk",
    "timestamp": 1772178608365,
    "message": "【下钻】发现 2 个关键子调用节点: main() -> SpringApplication.run() -> AdminController.getDashboardStats()",
    "type": "info"
  },
  {
    "id": "ozxgd",
    "timestamp": 1772178608365,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AnalysisController.protocols()",
    "type": "thinking"
  },
  {
    "id": "rc6pkp",
    "timestamp": 1772178624293,
    "message": "AI 调用完成：函数定位猜测Top3: AnalysisController.protocols",
    "type": "thinking",
    "aiTrace": {
      "label": "函数定位猜测Top3: AnalysisController.protocols",
      "request": "{\n  \"prompt\": \"\\n你是代码定位助手。请根据函数名、调用上下文与项目代码文件列表，猜测该函数定义最可能所在的 3 个文件（仅返回项目内相对路径）。\\n如果目标函数看起来是系统函数或编程语言标准库/第三方库函数（例如 C 标准库、C++ STL、Java SDK、Node/Python 内置库等），请不要猜测项目文件，直接输出系统库标记。\\n\\n项目语言：Java\\n调用者函数：SpringApplication.run\\n调用者文件：src/main/java/com/easytshark/server/controller/AnalysisController.java\\n目标函数：AnalysisController.protocols\\n代码文件列表（过滤后）：\\n[\\\"src/main/java/com/easytshark/server/TsharkServerApplication.java\\\",\\\"src/main/java/com/easytshark/server/analysis/AnalysisSqliteWriter.java\\\",\\\"src/main/java/com/eas ...[还有 6374 字节]\"\n}",
      "response": "{\n  \"isSystemOrLibraryFunction\": false,\n  \"systemOrLibraryReason\": \"\",\n  \"systemOrLibraryMarker\": \"\",\n  \"candidateFiles\": [\n    \"src/main/java/com/easytshark/server/controller/AnalysisController.java\",\n    \"src/main/java/com/easytshark/server/service/AnalysisQueryService.java\",\n    \"src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java\"\n  ],\n  \"reason\": \"目标函数 AnalysisController.protocols 明确指向 AnalysisController 类，该类极可能包含此接口定义，同时逻辑可能涉及协议查询或解析服务。\"\n}"
    }
  },
  {
    "id": "xoe25f",
    "timestamp": 1772178633369,
    "message": "AI 调用完成：函数定位AI兜底: AnalysisController.protocols",
    "type": "thinking",
    "aiTrace": {
      "label": "函数定位AI兜底: AnalysisController.protocols",
      "request": "{\n  \"prompt\": \"\\n你是代码函数定位助手。请在候选文件中定位目标函数定义所在文件。\\n注意：目标函数名可能是限定名（如 TSharkAPI::init），但在 C++ 头文件 class 内只会出现未限定方法名（如 init）。\\n\\n项目语言：Java\\n调用者函数：SpringApplication.run\\n调用者文件：src/main/java/com/easytshark/server/controller/AnalysisController.java\\n目标函数：AnalysisController.protocols\\n候选文件内容（节选）：\\n[{\\\"file\\\":\\\"src/main/java/com/easytshark/server/controller/AnalysisController.java\\\",\\\"contentSnippet\\\":\\\"package com.easytshark.server.controller;\\\\n\\\\nimport com.easytshark.server.dto.ApiResponse;\\\\nimport com.easytshark.server.dto.QueryRequest;\\\\nimport com.easytshark.server.service.AnalysisQueryService;\\\\nimport com.easytshark.server. ...[还有 50990 字节]\"\n}",
      "response": "{\n  \"found\": true,\n  \"file\": \"src/main/java/com/easytshark/server/controller/AnalysisController.java\",\n  \"methodNameHint\": \"protocols\",\n  \"reason\": \"在 AnalysisController 类中找到了名为 protocols 的方法定义，该方法通过 @PostMapping(\\\"/{taskId}/protocols\\\") 注解对外提供服务。\"\n}"
    }
  },
  {
    "id": "ixo0o",
    "timestamp": 1772178642977,
    "message": "AI 调用完成：函数下钻分析 L2: AnalysisController.protocols",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AnalysisController.protocols",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 9738 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AnalysisController.protocols\",\n  \"functionType\": \"function\",\n  \"description\": \"处理获取协议统计信息的 HTTP POST 请求，通过任务 ID 查询协议分布情况。\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"AnalysisQueryService.protocolStats\",\n      \"type\": \"method\",\n      \"description\": \"核心业务逻辑，执行数据库或内存中的协议统计分析。\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/AnalysisQueryService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"封装通用的 API 成功响应结构。\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "jqu4rp",
    "timestamp": 1772178642977,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AnalysisController.protocols() -> src/main/java/com/easytshark/server/controller/AnalysisController.java",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "step1-猜测文件-未命中(已扫描1个文件)",
      "step1b-同文件兜底-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "step1b-同文件兜底-未命中(已扫描1个文件)",
      "step2-AI基于文件列表猜测Top3",
      "step2-AI返回候选: src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java (原因: 目标函数 AnalysisController.protocols 明确指向 AnalysisController 类，该类极可能包含此接口定义，同时逻辑可能涉及协议查询或解析服务。)",
      "step2-AI猜测Top3校验-候选(3): src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/ProtocolTreeTranslator.java",
      "step2-AI猜测Top3校验-未命中(已扫描3个文件)",
      "step2b-AI候选文件内容兜底定位-提交AI兜底定位(候选3个)",
      "step2b-AI候选文件内容兜底定位-AI兜底命中: src/main/java/com/easytshark/server/controller/AnalysisController.java (在 AnalysisController 类中找到了名为 protocols 的方法定义，该方法通过 @PostMapping(\"/{taskId}/protocols\") 注解对外提供服务。)"
    ]
  },
  {
    "id": "1wn6cb",
    "timestamp": 1772178642977,
    "message": "【下钻】发现 2 个关键子调用节点: main() -> SpringApplication.run() -> AnalysisController.protocols()",
    "type": "info"
  },
  {
    "id": "j05ewj",
    "timestamp": 1772178642977,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AnalysisController.packetStats()",
    "type": "thinking"
  },
  {
    "id": "9dg7bs",
    "timestamp": 1772178655371,
    "message": "AI 调用完成：函数定位猜测Top3: AnalysisController.packetStats",
    "type": "thinking",
    "aiTrace": {
      "label": "函数定位猜测Top3: AnalysisController.packetStats",
      "request": "{\n  \"prompt\": \"\\n你是代码定位助手。请根据函数名、调用上下文与项目代码文件列表，猜测该函数定义最可能所在的 3 个文件（仅返回项目内相对路径）。\\n如果目标函数看起来是系统函数或编程语言标准库/第三方库函数（例如 C 标准库、C++ STL、Java SDK、Node/Python 内置库等），请不要猜测项目文件，直接输出系统库标记。\\n\\n项目语言：Java\\n调用者函数：SpringApplication.run\\n调用者文件：src/main/java/com/easytshark/server/controller/AnalysisController.java\\n目标函数：AnalysisController.packetStats\\n代码文件列表（过滤后）：\\n[\\\"src/main/java/com/easytshark/server/TsharkServerApplication.java\\\",\\\"src/main/java/com/easytshark/server/analysis/AnalysisSqliteWriter.java\\\",\\\"src/main/java/com/e ...[还有 6376 字节]\"\n}",
      "response": "{\n  \"isSystemOrLibraryFunction\": false,\n  \"systemOrLibraryReason\": \"\",\n  \"systemOrLibraryMarker\": \"\",\n  \"candidateFiles\": [\n    \"src/main/java/com/easytshark/server/controller/AnalysisController.java\",\n    \"src/main/java/com/easytshark/server/service/AnalysisQueryService.java\",\n    \"src/main/java/com/easytshark/server/service/AdminStatsService.java\"\n  ],\n  \"reason\": \"目标函数带有 AnalysisController 前缀，极大概率定义在该 Controller 类中，或由其调用的相关分析服务类中。\"\n}"
    }
  },
  {
    "id": "miwa3d",
    "timestamp": 1772178665534,
    "message": "AI 调用完成：函数定位AI兜底: AnalysisController.packetStats",
    "type": "thinking",
    "aiTrace": {
      "label": "函数定位AI兜底: AnalysisController.packetStats",
      "request": "{\n  \"prompt\": \"\\n你是代码函数定位助手。请在候选文件中定位目标函数定义所在文件。\\n注意：目标函数名可能是限定名（如 TSharkAPI::init），但在 C++ 头文件 class 内只会出现未限定方法名（如 init）。\\n\\n项目语言：Java\\n调用者函数：SpringApplication.run\\n调用者文件：src/main/java/com/easytshark/server/controller/AnalysisController.java\\n目标函数：AnalysisController.packetStats\\n候选文件内容（节选）：\\n[{\\\"file\\\":\\\"src/main/java/com/easytshark/server/controller/AnalysisController.java\\\",\\\"contentSnippet\\\":\\\"package com.easytshark.server.controller;\\\\n\\\\nimport com.easytshark.server.dto.ApiResponse;\\\\nimport com.easytshark.server.dto.QueryRequest;\\\\nimport com.easytshark.server.service.AnalysisQueryService;\\\\nimport com.easytshark.serve ...[还有 50886 字节]\"\n}",
      "response": "{\n  \"found\": true,\n  \"file\": \"src/main/java/com/easytshark/server/controller/AnalysisController.java\",\n  \"methodNameHint\": \"packetStats\",\n  \"reason\": \"目标函数 AnalysisController.packetStats 在 src/main/java/com/easytshark/server/controller/AnalysisController.java 文件中定义，使用了 @PostMapping 注解。\"\n}"
    }
  },
  {
    "id": "9niqr",
    "timestamp": 1772178678488,
    "message": "AI 调用完成：函数下钻分析 L2: AnalysisController.packetStats",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AnalysisController.packetStats",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 9742 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AnalysisController.packetStats\",\n  \"functionType\": \"method\",\n  \"description\": \"处理获取数据包统计信息的接口请求，根据任务ID返回整体流量统计数据\",\n  \"importance\": \"medium\",\n  \"calls\": [\n    {\n      \"name\": \"AnalysisQueryService.getPacketStats\",\n      \"type\": \"method\",\n      \"description\": \"查询并生成指定任务的数据包统计分析结果\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/AnalysisQueryService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"构造成功响应的 DTO 对象\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "yhrie",
    "timestamp": 1772178678488,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AnalysisController.packetStats() -> src/main/java/com/easytshark/server/controller/AnalysisController.java",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "step1-猜测文件-未命中(已扫描1个文件)",
      "step1b-同文件兜底-候选(1): src/main/java/com/easytshark/server/controller/AnalysisController.java",
      "step1b-同文件兜底-未命中(已扫描1个文件)",
      "step2-AI基于文件列表猜测Top3",
      "step2-AI返回候选: src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/AdminStatsService.java (原因: 目标函数带有 AnalysisController 前缀，极大概率定义在该 Controller 类中，或由其调用的相关分析服务类中。)",
      "step2-AI猜测Top3校验-候选(3): src/main/java/com/easytshark/server/controller/AnalysisController.java, src/main/java/com/easytshark/server/service/AnalysisQueryService.java, src/main/java/com/easytshark/server/service/AdminStatsService.java",
      "step2-AI猜测Top3校验-未命中(已扫描3个文件)",
      "step2b-AI候选文件内容兜底定位-提交AI兜底定位(候选3个)",
      "step2b-AI候选文件内容兜底定位-AI兜底命中: src/main/java/com/easytshark/server/controller/AnalysisController.java (目标函数 AnalysisController.packetStats 在 src/main/java/com/easytshark/server/controller/AnalysisController.java 文件中定义，使用了 @PostMapping 注解。)"
    ]
  },
  {
    "id": "tvrm4",
    "timestamp": 1772178678488,
    "message": "【下钻】发现 2 个关键子调用节点: main() -> SpringApplication.run() -> AnalysisController.packetStats()",
    "type": "info"
  },
  {
    "id": "9hg68o",
    "timestamp": 1772178678488,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AuthController.wechatCallback()",
    "type": "thinking"
  },
  {
    "id": "lfll5",
    "timestamp": 1772178697125,
    "message": "AI 调用完成：函数下钻分析 L2: AuthController.wechatCallback",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AuthController.wechatCallback",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 8785 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AuthController.wechatCallback\",\n  \"functionType\": \"method\",\n  \"description\": \"接收微信回调 code，执行微信授权登录并记录操作日志\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"wechatService.loginWithWechat\",\n      \"type\": \"method\",\n      \"description\": \"核心登录逻辑：使用 code 换取微信用户信息并生成 JWT 令牌\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/WechatService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录用户成功登录的审计日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logFailure\",\n      \"type\": \"method\",\n      \"description\": \"记录登录失败的异常日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"构造标准成功响应包装类\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "wdtmeh",
    "timestamp": 1772178697125,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AuthController.wechatCallback() -> src/main/java/com/easytshark/server/controller/AuthController.java:L43",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L43"
    ]
  },
  {
    "id": "grladq",
    "timestamp": 1772178697125,
    "message": "【下钻】发现 4 个关键子调用节点: main() -> SpringApplication.run() -> AuthController.wechatCallback()",
    "type": "info"
  },
  {
    "id": "og1cbk",
    "timestamp": 1772178697125,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AuthController.login()",
    "type": "thinking"
  },
  {
    "id": "gw4d26",
    "timestamp": 1772178712978,
    "message": "AI 调用完成：函数下钻分析 L2: AuthController.login",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AuthController.login",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 8767 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AuthController.login\",\n  \"functionType\": \"method\",\n  \"description\": \"处理用户登录请求，执行身份认证并记录操作日志\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"authService.login\",\n      \"type\": \"method\",\n      \"description\": \"执行核心登录验证逻辑，包括凭据校验和令牌生成\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/AuthService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录成功的登录审计日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logFailure\",\n      \"type\": \"method\",\n      \"description\": \"记录登录失败的异常信息与审计日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"封装标准 API 成功返回结果\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "g2tyss",
    "timestamp": 1772178712978,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AuthController.login() -> src/main/java/com/easytshark/server/controller/AuthController.java:L57",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L57"
    ]
  },
  {
    "id": "x6xeth",
    "timestamp": 1772178712978,
    "message": "【下钻】发现 4 个关键子调用节点: main() -> SpringApplication.run() -> AuthController.login()",
    "type": "info"
  },
  {
    "id": "nq6in",
    "timestamp": 1772178712978,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AuthController.updateProfile()",
    "type": "thinking"
  },
  {
    "id": "knweaw",
    "timestamp": 1772178728989,
    "message": "AI 调用完成：函数下钻分析 L2: AuthController.updateProfile",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AuthController.updateProfile",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 8783 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AuthController.updateProfile\",\n  \"functionType\": \"method\",\n  \"description\": \"更新当前登录用户的个人资料，并记录成功的操作日志或失败异常。\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"userService.currentUser\",\n      \"type\": \"method\",\n      \"description\": \"从安全上下文中获取当前登录用户实体\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/UserService.java\"\n    },\n    {\n      \"name\": \"userService.updateProfile\",\n      \"type\": \"method\",\n      \"description\": \"执行用户资料更新的具体业务逻辑\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/UserService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录成功的操作审计日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"userService.profile\",\n      \"type\": \"method\",\n      \"description\": \"将用户实体对象包装为返回给前端的 Profile DTO\",\n      \"importance\": \"low\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/UserService.java\"\n    },\n    {\n      \"name\": \"operationLogService.logFailure\",\n      \"type\": \"method\",\n      \"description\": \"捕获异常并记录失败的操作日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "lpkoum",
    "timestamp": 1772178728989,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AuthController.updateProfile() -> src/main/java/com/easytshark/server/controller/AuthController.java:L71",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L71"
    ]
  },
  {
    "id": "58sy5e",
    "timestamp": 1772178728989,
    "message": "【下钻】发现 5 个关键子调用节点: main() -> SpringApplication.run() -> AuthController.updateProfile()",
    "type": "info"
  },
  {
    "id": "izo3rc",
    "timestamp": 1772178728989,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> AuthController.logout()",
    "type": "thinking"
  },
  {
    "id": "bmhz1",
    "timestamp": 1772178744025,
    "message": "AI 调用完成：函数下钻分析 L2: AuthController.logout",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: AuthController.logout",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 8769 字节]\"\n}",
      "response": "{\n  \"functionName\": \"AuthController.logout\",\n  \"functionType\": \"method\",\n  \"description\": \"处理用户注销请求，解析令牌并记录操作日志\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"extractToken\",\n      \"type\": \"method\",\n      \"description\": \"从 HttpServletRequest 的 Authorization 头中提取 Bearer 令牌\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/controller/AuthController.java\"\n    },\n    {\n      \"name\": \"jwtService.parse\",\n      \"type\": \"method\",\n      \"description\": \"解析 JWT 令牌以获取包含用户 ID 的 Claims\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/JwtService.java\"\n    },\n    {\n      \"name\": \"userRepository.findById\",\n      \"type\": \"method\",\n      \"description\": \"根据用户 ID 从数据库查询用户信息以获取用户名\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 0,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/domain/repository/UserRepository.java\"\n    },\n    {\n      \"name\": \"operationLogService.logSuccess\",\n      \"type\": \"method\",\n      \"description\": \"记录注销成功的操作日志\",\n      \"importance\": \"medium\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/OperationLogService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"返回标准成功响应对象\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "buefv",
    "timestamp": 1772178744025,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> AuthController.logout() -> src/main/java/com/easytshark/server/controller/AuthController.java:L87",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/AuthController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/AuthController.java:L87"
    ]
  },
  {
    "id": "xz7qm",
    "timestamp": 1772178744025,
    "message": "【下钻】发现 5 个关键子调用节点: main() -> SpringApplication.run() -> AuthController.logout()",
    "type": "info"
  },
  {
    "id": "sxszecd",
    "timestamp": 1772178744025,
    "message": "【下钻】下钻 L2: main() -> SpringApplication.run() -> FileController.list()",
    "type": "thinking"
  },
  {
    "id": "nxlykj",
    "timestamp": 1772178755010,
    "message": "AI 调用完成：函数下钻分析 L2: FileController.list",
    "type": "thinking",
    "aiTrace": {
      "label": "函数下钻分析 L2: FileController.list",
      "request": "{\n  \"prompt\": \"\\n你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。\\n请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。\\n\\n规则：\\n1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 10 个子节点。\\n2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。\\n3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。\\n4. 描述要简短中文。\\n\\n6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。\\n\\n项目语言：Jav ...[还有 8368 字节]\"\n}",
      "response": "{\n  \"functionName\": \"FileController.list\",\n  \"functionType\": \"method\",\n  \"description\": \"处理获取文件列表请求，获取当前用户身份并查询其名下的所有文件。\",\n  \"importance\": \"high\",\n  \"calls\": [\n    {\n      \"name\": \"UserService.currentUser\",\n      \"type\": \"method\",\n      \"description\": \"获取当前认证登录的用户对象\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/UserService.java\"\n    },\n    {\n      \"name\": \"FileService.listFiles\",\n      \"type\": \"method\",\n      \"description\": \"根据用户信息查询并返回文件列表\",\n      \"importance\": \"high\",\n      \"shouldDrill\": 1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/service/FileService.java\"\n    },\n    {\n      \"name\": \"ApiResponse.success\",\n      \"type\": \"method\",\n      \"description\": \"构造成功的统一响应格式\",\n      \"importance\": \"low\",\n      \"shouldDrill\": -1,\n      \"possibleFile\": \"src/main/java/com/easytshark/server/dto/ApiResponse.java\"\n    }\n  ]\n}"
    }
  },
  {
    "id": "egiog",
    "timestamp": 1772178755010,
    "message": "【下钻】定位成功：main() -> SpringApplication.run() -> FileController.list() -> src/main/java/com/easytshark/server/controller/FileController.java:L32",
    "type": "thinking",
    "details": [
      "step1-猜测文件-候选(1): src/main/java/com/easytshark/server/controller/FileController.java",
      "step1-猜测文件-命中: src/main/java/com/easytshark/server/controller/FileController.java:L32"
    ]
  },
  {
    "id": "wgc4zj",
    "timestamp": 1772178755010,
    "message": "【下钻】发现 3 个关键子调用节点: main() -> SpringApplication.run() -> FileController.list()",
    "type": "info"
  },
  {
    "id": "cltx9a",
    "timestamp": 1772178755010,
    "message": "【下钻】递归下钻完成，正在整理最终全景图信息...",
    "type": "thinking"
  },
  {
    "id": "42bcu",
    "timestamp": 1772178755010,
    "message": "AI Agent: 正在基于完整调用链进行模块划分...",
    "type": "thinking"
  },
  {
    "id": "tya8ld",
    "timestamp": 1772178783354,
    "message": "AI 调用完成：最终模块划分（基于完整调用链）",
    "type": "thinking",
    "aiTrace": {
      "label": "最终模块划分（基于完整调用链）",
      "request": "{\n  \"prompt\": \"\\n你是代码架构模块划分专家。请根据项目概述、文件列表、完整函数调用链，对当前全景图节点进行模块划分。\\n\\n要求：\\n1. 模块按“职责/领域”划分（不是按目录）。\\n2. 模块数量控制在 3~10 个。\\n3. 所有 nodeId 必须分配到一个模块。\\n4. 不要改动 nodeId。\\n5. 返回 JSON。\\n\\n项目元数据：\\n{\\\"repoUrl\\\":\\\"/Users/xuanyuan/Documents/AI-Program/easytshark-online-server-java/\\\",\\\"repoName\\\":\\\"easytshark-online-server-java\\\",\\\"language\\\":\\\"Java\\\",\\\"generatedAt\\\":\\\"2026-02-27T07:48:46.014Z\\\"}\\n\\n项目概要：\\n基于 Spring Boot 3 开发的在线 Tshark 流量分析后端系统，提供网络协议分析、数据持久化及安全认证功能。\\n\\n项目文件列表（过滤后代码文件）：\\n[\\\"src/main/java/com/easytshark/server/Ts ...[还有 65751 字节]\"\n}",
      "response": "{\n  \"modules\": [\n    {\n      \"id\": \"system_bootstrap\",\n      \"name\": \"系统启动与配置\",\n      \"description\": \"负责应用程序引导、Spring Boot 框架集成及全局配置参数管理\"\n    },\n    {\n      \"id\": \"identity_access_management\",\n      \"name\": \"身份与访问控制\",\n      \"description\": \"处理用户认证、JWT 令牌管理、微信第三方登录及用户个人资料维护\"\n    },\n    {\n      \"id\": \"traffic_analysis_engine\",\n      \"name\": \"流量分析引擎\",\n      \"description\": \"执行 Tshark 协议解析、数据包统计及流量分析结果查询\"\n    },\n    {\n      \"id\": \"administration_dashboard\",\n      \"name\": \"管理后台与仪表盘\",\n      \"description\": \"管理员登录控制及系统运行状况的汇总统计指标\"\n    },\n    {\n      \"id\": \"file_resource_management\",\n      \"name\": \"文件资源管理\",\n      \"description\": \"管理用户上传的流量文件及存储相关业务逻辑\"\n    },\n    {\n      \"id\": \"audit_logging\",\n      \"name\": \"操作审计日志\",\n      \"description\": \"记录用户和管理员的各项操作行为，支持安全审计与故障追溯\"\n    },\n    {\n      \"id\": \"common_infrastructure\",\n      \"name\": \"通用基础架构\",\n      \"description\": \"提供标准 API 响应封装及通用的数据传输对象\"\n    }\n  ],\n  \"nodeModuleMap\": {\n    \"n_0_1_root_main\": \"system_bootstrap\",\n    \"n_1_2_n_0_1_root_main_springapplication-run\": \"system_bootstrap\",\n    \"n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin\": \"administration_dashboard\",\n    \"n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout\": \"administration_dashboard\",\n    \"n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats\": \"administration_dashboard\",\n    \"n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols\": \"traffic_analysis_engine\",\n    \"n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats\": \"traffic_analysis_engine\",\n    \"n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback\": \"identity_access_management\",\n    \"n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login\": \"identity_access_management\",\n    \"n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile\": \"identity_access_management\",\n    \"n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout\": \"identity_access_management\",\n    \"n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list\": \"file_resource_management\",\n    \"n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin\": \"system_bootstrap\",\n    \"n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure\": \"audit_logging\",\n    \"n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken\": \"identity_access_management\",\n    \"n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin\": \"system_bootstrap\",\n    \"n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats\": \"administration_dashboard\",\n    \"n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats\": \"traffic_analysis_engine\",\n    \"n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats\": \"traffic_analysis_engine\",\n    \"n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat\": \"identity_access_management\",\n    \"n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure\": \"audit_logging\",\n    \"n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login\": \"identity_access_management\",\n    \"n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure\": \"audit_logging\",\n    \"n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser\": \"identity_access_management\",\n    \"n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile\": \"identity_access_management\",\n    \"n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile\": \"identity_access_management\",\n    \"n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure\": \"audit_logging\",\n    \"n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken\": \"identity_access_management\",\n    \"n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse\": \"identity_access_management\",\n    \"n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid\": \"identity_access_management\",\n    \"n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess\": \"audit_logging\",\n    \"n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success\": \"common_infrastructure\",\n    \"n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser\": \"identity_access_management\",\n    \"n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles\": \"file_resource_management\",\n    \"n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success\": \"common_infrastructure\"\n  }\n}"
    }
  },
  {
    "id": "m0n59q",
    "timestamp": 1772178783354,
    "message": "模块划分完成（AI 基于完整调用链研判）",
    "type": "success"
  },
  {
    "id": "5pwo8",
    "timestamp": 1772178783354,
    "message": "全景图生成完成（逐步下钻模式）",
    "type": "success"
  }
]
```

## 6. 全景图展示数据
```json
{
  "modules": [
    {
      "id": "system_bootstrap",
      "name": "系统启动与配置",
      "color": "#3b82f6"
    },
    {
      "id": "identity_access_management",
      "name": "身份与访问控制",
      "color": "#06b6d4"
    },
    {
      "id": "traffic_analysis_engine",
      "name": "流量分析引擎",
      "color": "#10b981"
    },
    {
      "id": "administration_dashboard",
      "name": "管理后台与仪表盘",
      "color": "#f59e0b"
    },
    {
      "id": "file_resource_management",
      "name": "文件资源管理",
      "color": "#ef4444"
    },
    {
      "id": "audit_logging",
      "name": "操作审计日志",
      "color": "#8b5cf6"
    },
    {
      "id": "common_infrastructure",
      "name": "通用基础架构",
      "color": "#ec4899"
    }
  ],
  "nodeModuleMap": {
    "n_0_1_root_main": "system_bootstrap",
    "n_1_2_n_0_1_root_main_springapplication-run": "system_bootstrap",
    "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin": "administration_dashboard",
    "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout": "administration_dashboard",
    "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats": "administration_dashboard",
    "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols": "traffic_analysis_engine",
    "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats": "traffic_analysis_engine",
    "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback": "identity_access_management",
    "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login": "identity_access_management",
    "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile": "identity_access_management",
    "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout": "identity_access_management",
    "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list": "file_resource_management",
    "n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin": "system_bootstrap",
    "n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure": "audit_logging",
    "n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken": "identity_access_management",
    "n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess": "audit_logging",
    "n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success": "common_infrastructure",
    "n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin": "system_bootstrap",
    "n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess": "audit_logging",
    "n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success": "common_infrastructure",
    "n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats": "administration_dashboard",
    "n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success": "common_infrastructure",
    "n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats": "traffic_analysis_engine",
    "n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success": "common_infrastructure",
    "n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats": "traffic_analysis_engine",
    "n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success": "common_infrastructure",
    "n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat": "identity_access_management",
    "n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess": "audit_logging",
    "n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure": "audit_logging",
    "n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success": "common_infrastructure",
    "n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login": "identity_access_management",
    "n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess": "audit_logging",
    "n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure": "audit_logging",
    "n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success": "common_infrastructure",
    "n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser": "identity_access_management",
    "n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile": "identity_access_management",
    "n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess": "audit_logging",
    "n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile": "identity_access_management",
    "n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure": "audit_logging",
    "n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken": "identity_access_management",
    "n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse": "identity_access_management",
    "n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid": "identity_access_management",
    "n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess": "audit_logging",
    "n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success": "common_infrastructure",
    "n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser": "identity_access_management",
    "n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles": "file_resource_management",
    "n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success": "common_infrastructure"
  },
  "nodeDescriptions": {
    "n_0_1_root_main": "项目主程序入口，负责引导 Spring Boot 应用程序的启动与初始化",
    "n_1_2_n_0_1_root_main_springapplication-run": "框架桥接节点（Java Spring Boot 框架桥接：SpringApplication.run 是 Spring Boot 框架提供的标准库函数，用于启动 Spring 应用实例。），已切换到项目业务入口继续下钻",
    "n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin": "处理管理员登录请求，验证配置文件中的静态凭据，记录操作日志并生成 JWT 令牌。",
    "n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout": "处理管理员登出请求，记录登出日志并返回成功响应",
    "n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardstats": "处理管理员仪表盘统计数据的 GET 请求，返回系统整体运行指标的统计快照。",
    "n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols": "处理获取协议统计信息的 HTTP POST 请求，通过任务 ID 查询协议分布情况。",
    "n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats": "处理获取数据包统计信息的接口请求，根据任务ID返回整体流量统计数据",
    "n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback": "接收微信回调 code，执行微信授权登录并记录操作日志",
    "n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login": "处理用户登录请求，执行身份认证并记录操作日志",
    "n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile": "更新当前登录用户的个人资料，并记录成功的操作日志或失败异常。",
    "n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout": "处理用户注销请求，解析令牌并记录操作日志",
    "n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list": "处理获取文件列表请求，获取当前用户身份并查询其名下的所有文件。",
    "n_3_13_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_appproperties-getadmin": "从配置中获取预设的管理员用户名和密码",
    "n_3_14_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logfailure": "记录登录失败的操作日志，包括错误信息和请求上下文",
    "n_3_15_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_jwtservice-generatetoken": "根据管理员 UUID 和身份信息生成 JWT 访问令牌",
    "n_3_16_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_operationlogservice-logsuccess": "记录登录成功的操作日志",
    "n_3_17_n_2_3_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogin_apiresponse-success": "封装并返回包含登录结果的响应体",
    "n_3_18_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_appproperties-getadmin": "获取配置文件中的管理员账户信息",
    "n_3_19_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_operationlogservice-logsuccess": "记录成功的操作日志（登出事件）",
    "n_3_20_n_2_4_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-adminlogout_apiresponse-success": "构建成功的 API 响应对象",
    "n_3_21_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_adminstatsservice-getdashboardstats": "调用统计服务获取汇总数据",
    "n_3_22_n_2_5_n_1_2_n_0_1_root_main_springapplication-run_admincontroller-getdashboardst_apiresponse-success": "封装成功响应对象",
    "n_3_23_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_analysisqueryservice-protocolstats": "核心业务逻辑，执行数据库或内存中的协议统计分析。",
    "n_3_24_n_2_6_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-protocols_apiresponse-success": "封装通用的 API 成功响应结构。",
    "n_3_25_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_analysisqueryservice-getpacketstats": "查询并生成指定任务的数据包统计分析结果",
    "n_3_26_n_2_7_n_1_2_n_0_1_root_main_springapplication-run_analysiscontroller-packetstats_apiresponse-success": "构造成功响应的 DTO 对象",
    "n_3_27_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_wechatservice-loginwithwechat": "核心登录逻辑：使用 code 换取微信用户信息并生成 JWT 令牌",
    "n_3_28_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logsuccess": "记录用户成功登录的审计日志",
    "n_3_29_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_operationlogservice-logfailure": "记录登录失败的异常日志",
    "n_3_30_n_2_8_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-wechatcallback_apiresponse-success": "构造标准成功响应包装类",
    "n_3_31_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_authservice-login": "执行核心登录验证逻辑，包括凭据校验和令牌生成",
    "n_3_32_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logsuccess": "记录成功的登录审计日志",
    "n_3_33_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_operationlogservice-logfailure": "记录登录失败的异常信息与审计日志",
    "n_3_34_n_2_9_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-login_apiresponse-success": "封装标准 API 成功返回结果",
    "n_3_35_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-currentuser": "从安全上下文中获取当前登录用户实体",
    "n_3_36_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-updateprofile": "执行用户资料更新的具体业务逻辑",
    "n_3_37_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logsuccess": "记录成功的操作审计日志",
    "n_3_38_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_userservice-profile": "将用户实体对象包装为返回给前端的 Profile DTO",
    "n_3_39_n_2_10_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-updateprofile_operationlogservice-logfailure": "捕获异常并记录失败的操作日志",
    "n_3_40_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_extracttoken": "从 HttpServletRequest 的 Authorization 头中提取 Bearer 令牌",
    "n_3_41_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_jwtservice-parse": "解析 JWT 令牌以获取包含用户 ID 的 Claims",
    "n_3_42_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_userrepository-findbyid": "根据用户 ID 从数据库查询用户信息以获取用户名",
    "n_3_43_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_operationlogservice-logsuccess": "记录注销成功的操作日志",
    "n_3_44_n_2_11_n_1_2_n_0_1_root_main_springapplication-run_authcontroller-logout_apiresponse-success": "返回标准成功响应对象",
    "n_3_45_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_userservice-currentuser": "获取当前认证登录的用户对象",
    "n_3_46_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_fileservice-listfiles": "根据用户信息查询并返回文件列表",
    "n_3_47_n_2_12_n_1_2_n_0_1_root_main_springapplication-run_filecontroller-list_apiresponse-success": "构造成功的统一响应格式"
  }
}
```

## 7. AI 调用统计
```json
{
  "inputTokens": 83285,
  "outputTokens": 23521,
  "callCount": 20
}
```
