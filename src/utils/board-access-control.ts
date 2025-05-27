/**
 * Board Access Control Utility
 *
 * Provides functions for checking access to Trello boards based on configuration.
 */

import config from '../config.js';
import { ServiceFactory } from '../services/service-factory.js';

/**
 * Error class for board access control violations
 */
export class BoardAccessError extends Error {
    constructor(boardId: string, operation: string, allowedBoardsKey: string) {
        super(`Access denied: Operation '${operation}' on board '${boardId}' is not allowed by the configured access control group: "${allowedBoardsKey}"`)
        this.name = 'BoardAccessError';
    }
}


const boardIdCache = new Map<string, string>();
export async function fetchBoardNormalId(shortOrNormalID: string): Promise<string> {
    const cachedId = boardIdCache.get(shortOrNormalID);
    if (cachedId !== undefined) {
        return cachedId;
    }
    try {
        const boardService = ServiceFactory.getInstance().getBoardService()
        const boardId = (await boardService.getBoard(shortOrNormalID)).id

        boardIdCache.set(shortOrNormalID, boardId);
        return boardId;
    } catch (error) {
        throw new BoardAccessError(shortOrNormalID, 'getBoard', 'board_not_found');
    }
}

/**
 * Checks if a board ID is allowed based on the configuration
 * @param boardId - The board ID to check
 * @param operation - The operation being performed
 * @returns true if the board is allowed
 * @throws BoardAccessError if the board is not allowed
 */
export async function checkBoardAccess(boardId: string, operation: string, fetchNormalBoardId: boolean = true): Promise<boolean> {
    if (fetchNormalBoardId) {
        boardId = await fetchBoardNormalId(boardId)
    }

    // If no allowed board IDs are specified, all boards are allowed
    if (!config.trello.allowedBoardIds || config.trello.allowedBoardIds.length === 0) {
        return true;
    }

    // Check if the board ID is in the allowed list
    const isAllowed = config.trello.allowedBoardIds.includes(boardId);

    if (!isAllowed) {
        // Log the unauthorized access attempt
        if (config.debug) {
            const configSource = config.trello.configPath && config.trello.allowedBoardsKey
                ? `YAML config (${config.trello.configPath}:${config.trello.allowedBoardsKey})`
                : 'configuration';
            console.error(`[UNAUTHORIZED] Attempted ${operation} on board ${boardId} which is not in the allowed list from ${configSource}.`);
            console.error(`[UNAUTHORIZED] Allowed board IDs: ${config.trello.allowedBoardIds.join(', ')}`);
        }

        // Throw an error
        throw new BoardAccessError(boardId, operation, config.trello.allowedBoardsKey!);
    }

    return true;
}
