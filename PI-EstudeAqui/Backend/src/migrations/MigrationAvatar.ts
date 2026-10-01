import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarToUsers1790000000000 implements MigrationInterface {
    name = 'AddAvatarToUsers1790000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN avatar_url`)
    }
}