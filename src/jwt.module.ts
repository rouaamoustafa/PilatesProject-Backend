// import { Global, Module } from "@nestjs/common";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { JwtModule } from "@nestjs/jwt";
// import { PassportModule } from "@nestjs/passport";
// // Remove the JwtStrategy import

// @Global()
// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: "jwt" }),
//     ConfigModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (cfg: ConfigService) => ({
//         secret: cfg.get<string>("JWT_SECRET") || "your-jwt-secret",
//         signOptions: { expiresIn: "1d" },
//       }),
//     }),
//   ],
//   // Remove JwtStrategy from providers
//   providers: [],
//   exports: [PassportModule, JwtModule],
// })
// export class GlobalJwtModule {}