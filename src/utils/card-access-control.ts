/**
 * Card Access Control Utility
 *
 * Provides functions for checking access to Trello cards based on their board.
 */

import { ServiceFactory } from '../services/service-factory.js';
import { checkBoardAccess, BoardAccessError } from './board-access-control.js';

/**
 * Checks if a card is allowed based on its board ID
 * @param cardId - The card ID to check
 * @returns Promise resolving to true if the card is allowed, false otherwise
 */
export async function checkCardAccess(cardId: string, operation: string): Promise<void> {
    try {
        // Get the card to find its board ID
        const cardService = ServiceFactory.getInstance().getCardService();
        const card = await cardService.getCard(cardId);

        // Check if the card's board is allowed (throws if not allowed)
        await checkBoardAccess(card.idBoard, `${operation} (card ${cardId})`);
    } catch (error) {
        if (error instanceof BoardAccessError) {
            // Rethrow board access errors
            throw error;
        }

        // For other errors (like not finding the card), throw a new error
        console.error(`Error checking card access for ${cardId}:`, error);
        throw new Error(`Unable to verify access for card ${cardId}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Checks if a list ID is allowed based on its board ID
 * @param listId - The list ID to check
 * @returns Promise resolving to true if the list is allowed, false otherwise
 */
export async function checkListAccess(listId: string, operation: string): Promise<void> {
    try {
        // Get a list to find its board ID
        const listService = ServiceFactory.getInstance().getListService();
        const list = await listService.getList(listId);

        // Check if the list's board is allowed (throws if not allowed)
        await checkBoardAccess(list.idBoard, `${operation} (list ${listId})`);
    } catch (error) {
        if (error instanceof BoardAccessError) {
            // Rethrow board access errors
            throw error;
        }

        // For other errors (like not finding the list), throw a new error
        console.error(`Error checking list access for ${listId}:`, error);
        throw new Error(`Unable to verify access for list ${listId}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
