import { Module } from "@nestjs/common";
import { ImgbbService } from "./imgbb.service";
import { ConfigModule } from "@nestjs/config/dist/config.module";

@Module({
    imports: [ConfigModule],
    providers : [ImgbbService],
    exports: [ImgbbService],
})
export class ImgbbModule {}