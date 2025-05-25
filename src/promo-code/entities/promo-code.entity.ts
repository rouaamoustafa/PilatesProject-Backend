  import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    CreateDateColumn, Unique, Check,
  } from 'typeorm';
  import { Instructor } from '../../instructor/entities/instructor.entity';
  
  export enum PromoKind { PERCENT='percent', FLAT='flat' }
  
  @Entity('promo_codes')
  @Unique(['code'])
  @Check(`kind IN ('percent','flat')`)
  export class PromoCode {
    @PrimaryGeneratedColumn('uuid') id: string;
  
    @Column({ length: 32 }) code: string;
  
    @Column({ type: 'enum', enum: PromoKind }) kind: PromoKind;
  
    @Column('numeric', { precision: 10, scale: 2 }) value: number;
  
    @ManyToOne(() => Instructor, i => i.id, { onDelete: 'CASCADE' })
    instructor: Instructor;
  
    @Column({ type: 'timestamptz', nullable: true }) expiresAt?: Date;
    @Column({ type: 'int', nullable: true }) maxUses?: number;
    @Column({ type: 'int', default: 0 }) uses: number;
  
    @CreateDateColumn() createdAt: Date;
  }
  