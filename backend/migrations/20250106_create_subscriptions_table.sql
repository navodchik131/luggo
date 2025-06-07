-- Создание таблицы subscriptions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание ENUM типов
DO $$ BEGIN
    CREATE TYPE subscription_type_enum AS ENUM ('pro', 'pro_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('active', 'expired', 'cancelled', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_system_enum AS ENUM ('yookassa', 'cloudpayments', 'tinkoff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создание таблицы subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type subscription_type_enum NOT NULL DEFAULT 'pro',
    status subscription_status_enum NOT NULL DEFAULT 'pending',
    startDate TIMESTAMP NULL,
    endDate TIMESTAMP NULL,
    amount DECIMAL(10,2) NOT NULL,
    paymentId VARCHAR(255) NULL,
    paymentSystem payment_system_enum NULL,
    paymentData JSONB NULL,
    autoRenewal BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_subscriptions_userId ON subscriptions(userId);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_endDate ON subscriptions(endDate);

-- Комментарии
COMMENT ON TABLE subscriptions IS 'Подписки пользователей';
COMMENT ON COLUMN subscriptions.type IS 'Тип подписки: pro (499₽), pro_plus (999₽)';
COMMENT ON COLUMN subscriptions.status IS 'Статус подписки';
COMMENT ON COLUMN subscriptions.startDate IS 'Дата начала подписки';
COMMENT ON COLUMN subscriptions.endDate IS 'Дата окончания подписки';
COMMENT ON COLUMN subscriptions.amount IS 'Сумма оплаты в рублях';
COMMENT ON COLUMN subscriptions.paymentId IS 'ID платежа в платежной системе';
COMMENT ON COLUMN subscriptions.paymentSystem IS 'Платежная система';
COMMENT ON COLUMN subscriptions.paymentData IS 'Дополнительные данные о платеже';
COMMENT ON COLUMN subscriptions.autoRenewal IS 'Автоматическое продление'; 