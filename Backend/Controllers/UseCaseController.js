const UseCaseModel = require('../Models/UseCaseModel');

const UseCaseController = {

    async createUseCase(req, res) {

        try {

            const {
                ProjectID,
                Title,
                UseCaseType,
                Description,
                Priority,
                Status,
                CreatedBy
            } = req.body;


            if (!ProjectID) {

                return res.status(400).json({
                    message: 'ProjectID is required'
                });

            }


            if (!Title || !Title.trim()) {

                return res.status(400).json({
                    message: 'Use Case Title is required'
                });

            }

            const useCase =
                await UseCaseModel.createUseCase({

                    ProjectID: Number(ProjectID),

                    Title: Title.trim(),

                    UseCaseType: UseCaseType || 'Epic',

                    Description:
                        Description?.trim() || null,

                    Priority:
                        Priority || 'Medium',

                    Status:
                        Status || 'Created',

                    CreatedBy:
                        CreatedBy ? Number(CreatedBy) : null

                });


            return res.status(201).json({

                message:
                    'Use Case created successfully',

                data: useCase

            });

        }

        catch (error) {

            console.error(
                'Create Use Case Error:',
                error
            );

            return res.status(500).json({

                message:
                    'Failed to create Use Case',

                error:
                    error.message

            });

        }

    },


    async getUseCasesByProject(req, res) {

        try {

            const projectID =
                Number(req.params.projectId);


            if (!projectID) {

                return res.status(400).json({
                    message: 'Invalid ProjectID'
                });

            }


            const useCases =
                await UseCaseModel
                    .getUseCasesByProject(projectID);


            return res.status(200).json(
                useCases
            );

        }

        catch (error) {

            console.error(
                'Get Use Cases Error:',
                error
            );

            return res.status(500).json({

                message:
                    'Failed to load Use Cases',

                error:
                    error.message

            });

        }

    }

};

module.exports = UseCaseController;