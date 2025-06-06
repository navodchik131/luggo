// Логирование вынесено в отдельные console.log для упрощения
const { Task, User, Bid } = require('../models');

// Получение принятых заявок исполнителя
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Находим заявки где у пользователя есть принятый отклик
    const bids = await Bid.findAndCountAll({
      where: { 
        userId, 
        accepted: true 
      },
      include: [
        {
          model: Task,
          as: 'task',
          where: status ? { status } : {},
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'email', 'phone', 'rating']
            }
          ]
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'rating']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Преобразуем данные для удобства frontend
    const jobs = bids.rows.map(bid => ({
      id: bid.task.id,
      title: bid.task.title,
      description: bid.task.description,
      fromAddress: bid.task.fromAddress,
      toAddress: bid.task.toAddress,
      date: bid.task.date,
      category: bid.task.category,
      status: bid.task.status,
      createdAt: bid.task.createdAt,
      customer: bid.task.customer,
      bid: {
        id: bid.id,
        price: bid.price,
        comment: bid.comment,
        createdAt: bid.createdAt
      }
    }));

    res.json({
      success: true,
      jobs,
      pagination: {
        total: bids.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(bids.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения работ исполнителя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения ваших работ'
    });
  }
};

// Начать выполнение заявки
const startJob = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Проверяем что у пользователя есть принятый отклик на эту заявку
    const bid = await Bid.findOne({
      where: { 
        userId, 
        taskId, 
        accepted: true 
      },
      include: [
        {
          model: Task,
          as: 'task'
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена или у вас нет прав на её выполнение'
      });
    }

    // Проверяем статус заявки
    if (bid.task.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Заявка должна быть в статусе "В процессе"'
      });
    }

    // Можно добавить дополнительную логику для начала работы
    // Например, уведомления заказчику

    res.json({
      success: true,
      message: 'Работа начата успешно',
      task: bid.task
    });
  } catch (error) {
    console.error('Ошибка начала работы:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка начала выполнения работы'
    });
  }
};

// Завершить выполнение заявки
const completeJob = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { completionComment } = req.body;

    // Проверяем что у пользователя есть принятый отклик на эту заявку
    const bid = await Bid.findOne({
      where: { 
        userId, 
        taskId, 
        accepted: true 
      },
      include: [
        {
          model: Task,
          as: 'task',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена или у вас нет прав на её выполнение'
      });
    }

    // Проверяем статус заявки
    if (bid.task.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Можно завершить только заявки в процессе выполнения'
      });
    }

    // Обновляем статус заявки на "ожидает подтверждения"
    await bid.task.update({ 
      status: 'awaiting_confirmation'
    });

    // Добавляем комментарий о завершении в отклик
    if (completionComment) {
      await bid.update({
        comment: bid.comment + '\n\n[Завершение]: ' + completionComment
      });
    }

    // Создаем уведомление для заказчика
    const { Notification } = require('../models');
    await Notification.create({
      userId: bid.task.userId,
      type: 'task_completed',
      title: '✅ Работа выполнена',
      message: `Исполнитель завершил работу по заявке "${bid.task.title}". Пожалуйста, проверьте результат и подтвердите завершение.`,
      data: {
        taskId: bid.taskId,
        bidId: bid.id,
        executorName: req.user.name
      }
    });

    console.log(`✅ Уведомление создано для заказчика ${bid.task.customer.name} о завершении работы`);

    res.json({
      success: true,
      message: 'Работа отмечена как выполненная. Ожидается подтверждение от заказчика.',
      task: bid.task
    });
  } catch (error) {
    console.error('Ошибка завершения работы:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка завершения работы'
    });
  }
};

// Получение деталей работы
const getJobDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const bid = await Bid.findOne({
      where: { 
        userId, 
        taskId, 
        accepted: true 
      },
      include: [
        {
          model: Task,
          as: 'task',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'email', 'phone', 'rating', 'createdAt']
            }
          ]
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'rating']
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Работа не найдена'
      });
    }

    // Формируем ответ
    const jobDetails = {
      id: bid.task.id,
      title: bid.task.title,
      description: bid.task.description,
      fromAddress: bid.task.fromAddress,
      toAddress: bid.task.toAddress,
      date: bid.task.date,
      category: bid.task.category,
      status: bid.task.status,
      createdAt: bid.task.createdAt,
      customer: bid.task.customer,
      bid: {
        id: bid.id,
        price: bid.price,
        comment: bid.comment,
        createdAt: bid.createdAt
      }
    };

    res.json({
      success: true,
      job: jobDetails
    });
  } catch (error) {
    console.error('Ошибка получения деталей работы:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения деталей работы'
    });
  }
};

module.exports = {
  getMyJobs,
  startJob,
  completeJob,
  getJobDetails
}; 